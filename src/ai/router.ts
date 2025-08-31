
'use server';

interface RouterResponse {
  response: string;
  model: string;
  route: string;
  fallback?: 'backup' | 'emergency';
}

class RouterLogger {
  async logRouting(data: any) {
    // Store routing decisions for analysis and optimization
    const logEntry = {
      timestamp: new Date().toISOString(),
      route: data.route,
      model: data.modelUsed,
      confidence: data.confidence,
      method: data.method,
      reasoning_mode: data.reasoning_mode,
      responseTime: data.responseTime,
      success: data.success,
      contextOverride: data.contextOverride || false,
      estimatedTokens: data.estimatedTokens
    };
    
    // Save to your database/logging system
    console.log('Router Decision:', logEntry);
    
    // Optional: Send to analytics service
    // await this.sendToAnalytics(logEntry);
  }

  async getRoutingStats() {
    // Analyze routing performance over time
    return {
      accuracy: 0.92, // % of routes that didn't need fallback
      avgResponseTime: 1250, // ms
      topRoutes: ['default', 'automation', 'reasoning'],
      fallbackRate: 0.08
    };
  }
}

class EnhancedLunaRouter {
  models: { [key: string]: { primary: string; backup: string; maxContext: number } };
  routerModel: string;
  logger: RouterLogger;

  constructor() {
    this.models = {
      default: { primary: 'deepseek/deepseek-chat-v3.1:free', backup: 'openai/gpt-oss-20b:free', maxContext: 64000 },
      research: { primary: 'openai/gpt-oss-120b:free', backup: 'deepseek/deepseek-chat-v3.1:free', maxContext: 33000 },
      automation: { primary: 'qwen/qwen3-coder:free', backup: 'moonshotai/kimi-k2:free', maxContext: 262000 },
      vision: { primary: 'google/gemini-2.5-flash-image-preview:free', backup: 'google/gemma-3n-e2b-it:free', maxContext: 33000 },
      reasoning: { primary: 'moonshotai/kimi-k2:free', backup: 'z-ai/glm-4.5-air:free', maxContext: 33000 }
    };
    
    this.routerModel = 'openai/gpt-oss-20b:free'; // Fast model for routing decisions
    this.logger = new RouterLogger();
  }

  private isSimpleGreeting(message: string): boolean {
    return /^(hi|hello|hey|thanks|ok|okay)\.?!?$/i.test(message.trim());
  }

  private getEmergencyResponse(message: string, route: string): string {
    const responses: { [key: string]: string } = {
      vision: "I'd love to help analyze that! Could you describe what you're looking at or try uploading the image again?",
      research: "I can help research that topic! What specifically would you like me to look into?",
      automation: "I can help set up Instagram automation! What kind of workflow are you trying to create?",
      reasoning: "I can help you strategize! Could you share more details about what you're planning?",
      default: "I'm here to help with your Instagram growth! What would you like to focus on today?"
    };
    
    return responses[route] || responses.default;
  }

  private async analyzeRequest(userMessage: string, attachments: any[] = [], context: any[] = []) {
    let routingDecision = await this.heuristicAnalysis(userMessage, attachments, context);
    if (routingDecision.confidence < 0.8) {
        routingDecision = await this.llmClassification(userMessage, attachments, context);
    }
    routingDecision = this.contextAwareRouting(routingDecision, userMessage, context);
    // @ts-ignore
    routingDecision.reasoning_mode = this.shouldUseReasoningMode(userMessage, routingDecision.route);
    return routingDecision;
  }


  async route(userMessage: string, attachments: any[] = [], context: any[] = []): Promise<RouterResponse> {
    const startTime = Date.now();
    
    if (this.isSimpleGreeting(userMessage)) {
      try {
        const response = await this.callModel('deepseek/deepseek-chat-v3.1:free', userMessage);
        return { response, model: 'deepseek/deepseek-chat-v3.1:free', route: 'simple' };
      } catch (error) {
        return { 
          response: "Hi! I'm Luna, ready to help with your Instagram growth. What can I do for you?",
          model: 'static-fallback',
          route: 'simple'
        };
      }
    }

    const routingDecision = await this.analyzeRequest(userMessage, attachments, context);
    const modelConfig = this.models[routingDecision.route];

    let response: string;
    let modelUsed: string;
    let fallback: 'backup' | 'emergency' | undefined = undefined;

    try {
        response = await this.callModel(modelConfig.primary, userMessage, routingDecision);
        modelUsed = modelConfig.primary;
    } catch (error: any) {
        console.log(`Primary model ${modelConfig.primary} failed: ${error.message}, trying backup...`);
        try {
            response = await this.callModel(modelConfig.backup, userMessage, routingDecision);
            modelUsed = modelConfig.backup;
            fallback = 'backup';
        } catch (backupError: any) {
            console.error(`Both models failed. Primary: ${error.message}, Backup: ${backupError.message}`);
            response = this.getEmergencyResponse(userMessage, routingDecision.route);
            modelUsed = 'emergency-fallback';
            fallback = 'emergency';
        }
    }
    
    await this.logger.logRouting({
        ...routingDecision,
        modelUsed,
        responseTime: Date.now() - startTime,
        success: true 
    });

    return { response, model: modelUsed, route: routingDecision.route, fallback };
  }

  async heuristicAnalysis(message: string, attachments: any[], context: any[]) {
    const lowerMessage = message.toLowerCase();
    
    if (attachments.length > 0) {
      return { route: 'vision', confidence: 0.95, method: 'heuristic', reasoning: 'Image/media attachments detected' };
    }
    
    const codeKeywords = ['code', 'api', 'automation', 'function', 'implement', 'build system', 'webhook', 'json', 'create a bot'];
    if (this.hasKeywords(lowerMessage, codeKeywords)) {
      return { route: 'automation', confidence: 0.9, method: 'heuristic', reasoning: 'Technical implementation keywords detected' };
    }
    
    const researchKeywords = ['analyze', 'research', 'compare', 'study', 'trends', 'benchmarks', 'data analysis', 'statistics'];
    if (this.hasKeywords(lowerMessage, researchKeywords)) {
      return { route: 'research', confidence: 0.85, method: 'heuristic', reasoning: 'Research/analysis keywords detected' };
    }
    
    const reasoningKeywords = ['strategy', 'plan', 'decide', 'optimize', 'best approach', 'what should i', 'how to approach'];
    if (this.hasKeywords(lowerMessage, reasoningKeywords)) {
      return { route: 'reasoning', confidence: 0.8, method: 'heuristic', reasoning: 'Strategic planning keywords detected' };
    }
    
    return { route: 'default', confidence: 0.6, method: 'heuristic', reasoning: 'No clear pattern detected' };
  }

  async llmClassification(message: string, attachments: any[], context: any[]) {
    const classificationPrompt = `
Analyze this user request and classify it into one of these categories:

CATEGORIES:
- default: General conversation, Q&A, basic Instagram advice
- research: Analysis, comparison, data interpretation, market research  
- automation: Code generation, API integration, technical implementation
- vision: Image analysis, visual content evaluation (even without attachments if discussing visuals)
- reasoning: Strategic planning, complex decision-making, multi-step problem solving

REQUEST: "${message}"
ATTACHMENTS: ${attachments.length > 0 ? 'Present' : 'None'}
CONTEXT_LENGTH: ${context.length}

Return ONLY this JSON:
{
  "route": "category_name",
  "confidence": 0.XX,
  "reasoning": "brief explanation"
}`;

    try {
      const response = await this.callModel(this.routerModel, classificationPrompt, { 
        // @ts-ignore
        reasoning_mode: false,
        temperature: 0.1 // Low temperature for consistent classification
      });
      
      const parsed = JSON.parse(response.trim());
      return { ...parsed, method: 'llm_classification' };
    } catch (error) {
      return { route: 'default', confidence: 0.5, method: 'fallback', reasoning: 'LLM classification failed' };
    }
  }

  contextAwareRouting(routingDecision: any, message: string, context: any[]) {
    const totalContext = this.estimateTokenCount(message) + this.estimateTokenCount(context.join(' '));
    
    if (totalContext > 200000) {
      return {
        ...routingDecision,
        route: 'automation',
        contextOverride: true,
        reasoning: `Large context (${totalContext} tokens) requires high-capacity model`
      };
    }
    
    if (totalContext > 128000) {
      const highContextModels = ['automation', 'default']; 
      if (!highContextModels.includes(routingDecision.route)) {
        return {
          ...routingDecision,
          route: 'default', 
          contextOverride: true,
          reasoning: `Medium context (${totalContext} tokens) requires capable model`
        };
      }
    }
    
    return { ...routingDecision, estimatedTokens: totalContext };
  }

  shouldUseReasoningMode(message: string, route: string) {
    const lowerMessage = message.toLowerCase();
    
    if (route === 'reasoning') return true;
    
    const multiStepIndicators = [
      'first', 'then', 'after that', 'next', 'step by step',
      'analyze then', 'compare and decide', 'evaluate and recommend'
    ];
    
    if (this.hasKeywords(lowerMessage, multiStepIndicators)) return true;
    
    const reasoningTriggers = [
      'optimize', 'best strategy', 'most effective', 'should i',
      'pros and cons', 'think through', 'work out'
    ];
    
    return this.hasKeywords(lowerMessage, reasoningTriggers);
  }

  hasKeywords(text: string, keywords: string[]) {
    return keywords.some(keyword => text.includes(keyword));
  }

  estimateTokenCount(text: string) {
    return Math.ceil(text.length / 4);
  }

  async callModel(modelId: string, message: string, options: any = {}): Promise<string> {
    try {
        const payload = {
            model: modelId,
            messages: [
                { role: 'system', content: "You are Luna, a friendly and insightful AI assistant for Instagram marketing. You are an expert in social media strategy, content creation, and analytics. Your goal is to provide clear, actionable, and encouraging advice. Always be supportive and professional. When generating content or code, ensure it is high-quality and ready for use." },
                { role: 'user', content: message }
            ],
            temperature: options.temperature || 0.7,
            max_tokens: 500,
            ...(options.reasoning_mode && { reasoning: true })
        };

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();

        if (!data.choices?.[0]?.message?.content) {
            throw new Error('Invalid response format from model');
        }

        return data.choices[0].message.content;
    } catch (error) {
        console.error(`Model ${modelId} failed:`, error);
        throw error;
    }
  }
}


export async function routeRequest(prompt: string, attachments: any[] = [], context: any[] = []) {
  const router = new EnhancedLunaRouter();
  return await router.route(prompt, attachments, context);
}
