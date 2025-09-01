import { firestore } from 'firebase-admin';
import { routeRequest } from '@/ai/router';
import type { ConversationContext, ExtractedEntities, AmbiguitySignal } from './AgentTypes';

export class LunaAssistant {
  private db: firestore.Firestore;
  public conversationHistory: ConversationContext[] = [];
  public sessionId: string;
  private userId: string;

  constructor(userId: string, sessionId?: string) {
    this.userId = userId;
    this.sessionId = sessionId || this.generateSessionId();
    // This assumes Firebase has been initialized elsewhere in the app
    if (!firestore.getApps().length) {
        console.warn("Firebase Admin SDK not initialized. Conversation history will not be saved.");
        // @ts-ignore
        this.db = { collection: () => ({ add: async () => {}, where: () => ({ get: async () => ({ docs: [] })}) }) };

    } else {
        this.db = firestore();
        this.loadConversationHistory();
    }
  }

  /**
   * Main entry point - processes user input with context awareness
   */
  async handleUserInput(input: string): Promise<string> {
    try {
      // Extract entities and intent from user input
      const entities = await this.extractEntities(input);
      const intent = await this.classifyIntent(input, entities);

      // Store in conversation context
      const context: ConversationContext = {
        query: input,
        entities,
        intent,
        timestamp: new Date(),
        sessionId: this.sessionId
      };
      
      this.conversationHistory.push(context);
      await this.saveConversationContext(context);

      // Check for ambiguity using context
      const ambiguityCheck = await this.detectAmbiguity(input, entities, context);
      
      if (ambiguityCheck.isAmbiguous) {
        return await this.handleClarification(ambiguityCheck, context);
      }

      // Generate contextually aware response
      return await this.generateContextualResponse(input, entities, intent, context);

    } catch (error) {
      console.error('Luna processing error:', error);
      return this.getPersonalityFallback(input);
    }
  }

  /**
   * Extract named entities from user input
   */
  private async extractEntities(input: string): Promise<ExtractedEntities> {
    const entities: ExtractedEntities = {};
    
    // Simple regex-based entity extraction (can be replaced with NER API)
    const lowercaseInput = input.toLowerCase();
    
    // Wrestling entities
    const wrestlingPeople = ['roman reigns', 'bronson reed', 'seth rollins', 'cm punk'];
    entities.people = wrestlingPeople.filter(person => lowercaseInput.includes(person));
    
    // Event entities
    const wrestlingEvents = ['clash at the castle', 'clash in paris', 'wrestlemania', 'summerslam'];
    entities.events = wrestlingEvents.filter(event => lowercaseInput.includes(event));
    
    // Location entities
    const locations = ['paris', 'cardiff', 'wales', 'france'];
    entities.places = locations.filter(place => lowercaseInput.includes(place));
    
    // Instagram-specific entities
    const instagramTerms = ['followers', 'engagement', 'hashtags', 'reels', 'stories'];
    entities.topics = instagramTerms.filter(topic => lowercaseInput.includes(topic));

    return entities;
  }

  /**
   * Classify user intent based on input and entities
   */
  private async classifyIntent(input: string, entities: ExtractedEntities): Promise<string> {
    const lowercaseInput = input.toLowerCase();
    
    if (entities.people?.length || entities.events?.length) {
      return 'event_query';
    }
    
    if (entities.topics?.length) {
      return 'instagram_growth';
    }
    
    if (lowercaseInput.match(/^(hi|hello|hey)\.?!?$/)) {
      return 'greeting';
    }
    
    if (lowercaseInput.includes('how are you')) {
      return 'personal_query';
    }
    
    return 'general_query';
  }

  /**
   * Detect ambiguity in user queries using context
   */
  private async detectAmbiguity(
    input: string, 
    entities: ExtractedEntities, 
    context: ConversationContext
  ): Promise<AmbiguitySignal> {
    
    // Check for incomplete follow-ups
    const isFollowUp = this.isFollowUpQuery(input);
    const hasIncompletePreviousContext = this.hasIncompletePreviousContext();
    
    // Event ambiguity - "clash" without location
    if (entities.events?.some(e => e.includes('clash')) && !entities.places?.length) {
      return {
        isAmbiguous: true,
        missingInfo: ['location'],
        clarificationNeeded: 'event_location'
      };
    }
    
    // Follow-up without sufficient context
    if (isFollowUp && hasIncompletePreviousContext) {
      return {
        isAmbiguous: true,
        missingInfo: ['previous_context'],
        clarificationNeeded: 'follow_up_context'
      };
    }
    
    // Vague Instagram queries
    if (context.intent === 'instagram_growth' && input.length < 20) {
      return {
        isAmbiguous: true,
        missingInfo: ['specific_goal'],
        clarificationNeeded: 'instagram_specifics'
      };
    }

    return { isAmbiguous: false, clarificationNeeded: '' };
  }

  /**
   * Handle clarification dialogues with personality
   */
  private async handleClarification(
    ambiguity: AmbiguitySignal, 
    context: ConversationContext
  ): Promise<string> {
    
    const clarifications: { [key: string]: string[] } = {
      event_location: [
        "I want to make sure I get this right for you. Are you asking about Clash at the Castle in Cardiff or a different Clash event in Paris?",
        "Got it! Just to clarify - are you referring to the WWE Clash event in Wales or one in Paris? Want to give you accurate info!"
      ],
      
      follow_up_context: [
        "Let me make sure I understand your follow-up correctly. Could you provide a bit more context about what you're referring to?",
        "I want to give you the best answer - can you clarify what specific aspect you're asking about?"
      ],
      
      instagram_specifics: [
        "Let's get tactical! What's your specific Instagram goal? Are we talking follower growth, engagement rates, or content strategy?",
        "I'm here to give you actionable Instagram advice! What's your current challenge - followers stuck, engagement dropping, or content not working?"
      ]
    };
    
    const options = clarifications[ambiguity.clarificationNeeded] || [
      "I want to give you the most helpful answer. Could you provide a bit more detail about what you're looking for?"
    ];
    
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Generate contextually aware responses with personality
   */
  private async generateContextualResponse(
    input: string,
    entities: ExtractedEntities,
    intent: string,
    context: ConversationContext
  ): Promise<string> {
    
    // Use your existing LLM router with enhanced context
    const contextPrompt = this.buildContextPrompt(input, entities, intent, context);
    
    try {
      // Call your enhanced router with context
      const response = await routeRequest(contextPrompt);
      return response.response;
    } catch (error) {
      return this.getPersonalityFallback(input);
    }
  }

  /**
   * Build context-rich prompt for LLM
   */
  private buildContextPrompt(
    input: string,
    entities: ExtractedEntities,
    intent: string,
    context: ConversationContext
  ): string {
    
    const recentHistory = this.conversationHistory.slice(-3);
    const historyContext = recentHistory
      .map(h => `User: ${h.query}`)
      .join('\n');
    
    return `
You are Luna, Instagram Growth Mentor with Codie Sanchez personality.

CONVERSATION CONTEXT:
${historyContext}

CURRENT QUERY: ${input}
DETECTED ENTITIES: ${JSON.stringify(entities)}
USER INTENT: ${intent}

RESPONSE RULES:
- Never use generic phrases like "I'm here to help with Instagram growth"
- Be specific and actionable
- Use Codie Sanchez voice: confident, direct, tactical
- For off-topic questions: answer briefly, pivot to Instagram naturally
- Always end with a specific question or next step

CURRENT QUERY: ${input}
`;
  }


  /**
   * Personality-driven fallback responses
   */
  private getPersonalityFallback(input: string): string {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('hi') || lowerInput.includes('hello')) {
      return "Hey! Ready to cut through the Instagram BS and actually grow your account? What's your biggest challenge right now?";
    }
    
    if (lowerInput.includes('how are you')) {
      return "I'm fired up and ready to help you build something real! Most people are stuck posting pretty pictures - let's talk actual strategy.";
    }
    
    // For anything else, pivot to Instagram
    return "I can chat about anything, but I'm really here to help you dominate Instagram growth. What's your biggest challenge - followers, engagement, or converting your audience?";
  }

  /**
   * Helper methods
   */
  private isFollowUpQuery(input: string): boolean {
    const followUpPatterns = [
      /^(i meant|actually|no i|what about)/i,
      /^(in |at |the )/i
    ];
    return followUpPatterns.some(pattern => pattern.test(input));
  }

  private hasIncompletePreviousContext(): boolean {
    if (this.conversationHistory.length < 2) return false;
    const lastContext = this.conversationHistory[this.conversationHistory.length - 2]; // Look at context before the current input
    if (!lastContext) return false;
    
    const hasClashEvent = lastContext.entities.events?.some(e => e.includes('clash')) || false;
    const hasPlace = lastContext.entities.places?.length > 0;
    
    // Incomplete if it was a clash event query without a location
    return hasClashEvent && !hasPlace;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async loadConversationHistory(): Promise<void> {
    if (!this.db) return;
    // Load from Firestore
    const snapshot = await this.db.collection('conversation_history')
      .where('userId', '==', this.userId)
      .where('sessionId', '==', this.sessionId)
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();
    
    if (!snapshot.empty) {
        this.conversationHistory = snapshot.docs.map(doc => doc.data() as ConversationContext).reverse();
    }
  }

  private async saveConversationContext(context: ConversationContext): Promise<void> {
    if (!this.db) return;
    await this.db.collection('conversation_history').add({
      ...context,
      userId: this.userId
    });
  }
}
