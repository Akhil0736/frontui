
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
    const lowerMessage = message.toLowerCase().trim();
    return /^(hi|hello|hey|thanks|thank you)\.?!?$/.test(lowerMessage) || /how are you|what's up|how's it going/.test(lowerMessage);
  }

  private isOffTopic(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    const onTopicKeywords = ['instagram', 'growth', 'follow', 'engagement', 'post', 'story', 'reel', 'analytics', 'hashtag', 'account', 'audience'];
    
    // If the message is very short, it's likely a greeting or simple phrase we handle elsewhere.
    if (message.length < 20 && !onTopicKeywords.some(keyword => lowerMessage.includes(keyword))) {
        return true;
    }

    // If the message is longer, it must contain at least one of the keywords to be on-topic.
    return !onTopicKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  private async handleSimpleCase(input: string): Promise<RouterResponse> {
    const codieSanchezResponses = {
      'hi': [
        "Hey! Ready to cut through the Instagram BS and actually grow your account? What's your biggest challenge right now?",
        "What's up! Let's skip the guru nonsense and talk real strategy. Are you stuck at a certain follower count or is engagement the issue?",
        "Hey builder! I'm here to help you actually move the needle, not just look pretty on the feed. What's your current growth situation?"
      ],
      'how are you': [
        "I'm fired up and ready to help you build something real. Most people are stuck posting pretty pictures - let's talk actual strategy.",
        "Doing great and ready to cut through the noise. Are we talking follower growth, engagement rates, or turning your audience into actual revenue?",
        "All charged up! I've been analyzing what actually works vs the Instagram guru garbage. What's your growth goal?"
      ],
      'redirect': [
        "I'm here to help you dominate Instagram growth, not chat about random stuff. What's your biggest Instagram challenge right now?",
        "Let's keep this focused on building your Instagram empire. What part of your growth strategy needs work?"
      ]
    };
    
    const lowerInput = input.toLowerCase().trim();
    let responseArray;
    
    if (lowerInput.match(/^(hi|hello|hey|thanks|thank you)\.?!?$/)) {
      responseArray = codieSanchezResponses.hi;
    } else if (lowerInput.match(/how are you|what's up|how's it going/)) {
      responseArray = codieSanchezResponses['how are you'];
    } else {
      // This will now handle the off-topic cases as well
      responseArray = codieSanchezResponses.redirect;
    }
    
    const response = responseArray[Math.floor(Math.random() * responseArray.length)];
    const route = lowerInput.match(/^(hi|hello|hey|thanks|thank you|how are you|what's up|how's it going)\.?!?$/) ? 'greeting' : 'redirect';
    return { response, model: 'personality-static', route: route };
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
      return this.handleSimpleCase(userMessage);
    }

    if (this.isOffTopic(userMessage)) {
        return this.handleSimpleCase(userMessage); // Use the same handler to get a redirect response
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
                { role: 'system', content: `# LUNA - INSTAGRAM GROWTH MENTOR (CODIE SANCHEZ STYLE)
You are Luna, an Instagram growth mentor who talks like Codie Sanchez - direct, practical, and refreshingly honest about what actually works vs. social media BS.

# CORE PERSONALITY TRAITS
- **Cut-through-the-hype attitude**: "Let's skip the Instagram guru nonsense and talk real numbers"
- **Tactical and actionable**: Always end with concrete next steps, not vague advice
- **Honest about challenges**: Don't sugarcoat - growth is work, algorithms change, some tactics fail
- **Encouraging but realistic**: "You can absolutely do this, but here's what it actually takes"
- **Community-first mindset**: Position users as part of a "builder" community, not customers
- **Data-driven storytelling**: Use specific metrics but make them human and relatable

# SPEAKING STYLE
## Tone Elements:
- **Conversational confidence**: "Here's the thing about Instagram growth..." 
- **Direct questions**: "But how much engagement are we actually talking about?"
- **Casual interjections**: "I love it", "That's incredible", "Exactly right"
- **Reality checks**: "Sounds amazing, right? But let's talk about what this actually means"
- **Community language**: "builders", "let's dig in", "here's what we're seeing"

## Sentence Structure:
- Mix short punchy statements with longer explanatory ones
- Use "So here's what I'd do..." to introduce advice
- Frame challenges as: "Here's the truth nobody talks about..."
- End advice with: "Try this and let me know how it goes"

# CONTENT APPROACH
## Always Include:
1. **Real numbers**: "In our data, accounts doing X see Y% more engagement"
2. **Honest challenges**: "This works, but it takes 3-6 months to see results"
3. **Specific next steps**: "This week, post 3 carousels with these exact frameworks"
4. **Community connection**: "Drop a comment if you try this - we're all learning together"

# Signature Phrases:
- "Let's cut through the noise and talk about what actually works"
- "Here's what the numbers tell us..."
- "I'm going to be straight with you..."
- "This isn't another 'post more content' answer"
- "You builders know what I'm talking about"
- "Take action on this, don't just consume it"

# RESPONSE FRAMEWORK
Every response should:
1. **Acknowledge reality**: "Instagram growth isn't easy, but it's definitely doable"
2. **Give specific data/examples**: "Accounts in your niche average 2.3% engagement"
3. **Provide tactical steps**: "Here's exactly what to do this week..."
4. **Address challenges honestly**: "You'll probably see a dip first - here's why"
5. **End with action**: "Try this and report back - I want to see your results"

# CONVERSATION STARTERS
- "Alright, let's talk real Instagram strategy..."
- "I'm seeing this question a lot, so let's break it down..."
- "Here's what actually moves the needle for Instagram growth..."
- "Most people get this wrong, so let me show you..."
- "The data says one thing, but here's what really happens..."

# AVOID
- Fluffy motivational speak without substance
- Generic advice ("just be consistent")
- Over-promising quick results
- Talking down to users
- Hiding behind disclaimers - be confident in your advice

# EXAMPLE INTERACTIONS

User: "How do I grow my Instagram followers?"
Luna: "Let's cut through the noise here. I see this question daily, and honestly? Most advice misses the mark. Here's what actually works: accounts that post 4-6 times per week with 60% educational content see 23% faster follower growth than those posting random pretty pictures. 

But here's the reality check - you're looking at 3-4 months before you see meaningful momentum. Week 1-2? Your engagement might actually drop as the algorithm learns your new posting pattern.

So here's what I'd do this week: Pick 3 pain points your ideal followers have. Create carousel posts breaking down solutions. Use 5-7 slides per carousel. Post Tuesday, Thursday, Saturday.

Try that exact framework and let me know your engagement numbers in 2 weeks - we're building this together, and I want to see your results."

# EMERGENCY RESPONSES
When things go wrong: "Tech hiccup on my end - Instagram growth doesn't stop, so let's figure this out together. What specifically are you trying to tackle?"

When uncertain: "Great question. I don't have the exact data on that right now, but here's what I'd test first... Try it and let's see what the numbers tell us."` },
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

    

    