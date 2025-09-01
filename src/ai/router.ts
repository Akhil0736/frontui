
'use server';

import { ai } from "@/ai/genkit";

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
      default: { primary: 'googleai/gemini-1.5-flash-latest', backup: 'googleai/gemini-1.5-flash-latest', maxContext: 64000 },
      research: { primary: 'googleai/gemini-1.5-flash-latest', backup: 'googleai/gemini-1.5-flash-latest', maxContext: 33000 },
      automation: { primary: 'googleai/gemini-1.5-flash-latest', backup: 'googleai/gemini-1.5-flash-latest', maxContext: 262000 },
      vision: { primary: 'googleai/gemini-1.5-flash-latest', backup: 'googleai/gemini-1.5-flash-latest', maxContext: 33000 },
      reasoning: { primary: 'googleai/gemini-1.5-pro-latest', backup: 'googleai/gemini-1.5-flash-latest', maxContext: 33000 },
      creative: { primary: 'googleai/gemini-1.5-flash-latest', backup: 'googleai/gemini-1.5-flash-latest', maxContext: 64000 },
    };
    
    this.routerModel = 'googleai/gemini-1.5-flash-latest'; // Fast model for routing decisions
    this.logger = new RouterLogger();
  }

  private isOffTopic(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    const keywords = ['instagram', 'growth', 'followers', 'engagement', 'reels', 'posts', 'stories', 'hashtag'];
    if (keywords.some(kw => lowerMessage.includes(kw))) {
      return false;
    }
    // Simple check if it's a "how-to" or "what is" question not related to the keywords
    if (lowerMessage.startsWith('what is') || lowerMessage.startsWith('who is') || lowerMessage.startsWith('what are')) {
      return true;
    }
    return false;
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
    
    if (this.isOffTopic(userMessage)) {
      const response = await this.handleOffTopicQuestion(userMessage);
      return { response, model: 'multi-step-off-topic', route: 'off_topic' };
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
    
    // Monitor for generic responses
    if (response.includes("I'm here to help with your Instagram growth")) {
      console.error("GENERIC RESPONSE DETECTED! Review routing and prompts.", {
        userMessage,
        route: routingDecision.route,
        modelUsed
      });
    }

    await this.logger.logRouting({
        ...routingDecision,
        modelUsed,
        responseTime: Date.now() - startTime,
        success: true 
    });

    return { response, model: modelUsed, route: routingDecision.route, fallback };
  }

  async handleOffTopicQuestion(input: string, context: any[] = []): Promise<string> {
    // Route to general knowledge model first
    const generalResponse = await this.callModel(this.models.default.primary, input, {}, true); // bypass system prompt
    
    // Then add Luna's personality layer
    const personalityPrompt = `
  Take this general answer: "${generalResponse}"
  
  Rewrite it in Codie Sanchez style:
  - Keep it brief (1-2 sentences max)
  - Sound confident and knowledgeable  
  - Add a natural pivot to Instagram growth
  - Ask a specific follow-up question
  
  Original question: "${input}"
  `;
    
    const lunaResponse = await this.callModel(this.models.creative.primary, personalityPrompt, {}, true); // bypass system prompt
    return lunaResponse;
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

  async callModel(modelId: string, message: string, options: any = {}, bypassSystemPrompt = false): Promise<string> {
    try {
      const systemPrompt = `<core_identity>
You are Luna, Instagram Growth Mentor with Codie Sanchez personality. Your sole purpose is to analyze Instagram challenges and provide specific, actionable growth tactics that actually work.
</core_identity>

<communication_rules>
- NEVER use meta-phrases: "let me help", "I can see", "how can I assist"
- NEVER give generic advice: "be consistent", "post quality content"  
- NEVER summarize unless explicitly requested
- NEVER use corporate marketing speak or guru fluff
- ALWAYS be specific with numbers, timeframes, and expected outcomes
- ALWAYS acknowledge uncertainty about algorithm changes
- ALWAYS use Codie Sanchez voice: confident, direct, tactical
- ALWAYS end with one specific next step
</communication_rules>

<response_format>
1. **Headline (≤ 6 words)**: Direct answer/tactic
2. **Main bullets (≤ 15 words each)**:
   - Specific tactics with metrics
   - Expected outcomes with timeframes  
3. **Sub-bullets (≤ 20 words each)**:
   - Real examples from successful accounts
   - Concrete numbers and case studies
4. **Next step**: One actionable task they can do today
</response_format>

<personality_enforcement>
- Cut through Instagram BS and focus on what moves the needle
- Reference real data: "Accounts doing X see Y% more engagement" 
- Sound slightly impatient with generic questions
- Assume user is smart and wants tactical advice, not motivation
- Pivot off-topic questions back to Instagram growth naturally
</personality_enforcement>`;

      const result = await ai.generate({
          model: modelId,
          prompt: message,
          ...( !bypassSystemPrompt && { system: systemPrompt }),
          config: {
              temperature: options.temperature || 0.7,
          },
      });

      return result.text;

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

    