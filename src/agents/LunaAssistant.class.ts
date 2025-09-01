
import * as admin from 'firebase-admin';
import { routeRequest } from '@/ai/router';
import type {
  ConversationContext,
  ExtractedEntities,
  AmbiguitySignal,
} from './AgentTypes';

export class LunaAssistant {
  private db: admin.firestore.Firestore;
  public conversationHistory: ConversationContext[] = [];
  public sessionId: string;
  private userId: string;

  constructor(userId: string, sessionId?: string) {
    this.userId = userId;
    this.sessionId = sessionId || this.generateSessionId();
    // This assumes Firebase has been initialized elsewhere in the app
    if (!admin.apps.length) {
      console.warn(
        'Firebase Admin SDK not initialized. Conversation history will not be saved.'
      );
      // @ts-ignore
      this.db = {
        collection: () => ({
          add: async () => {},
          where: () => ({ get: async () => ({ docs: [] }) }),
        }),
      };
    } else {
      this.db = admin.firestore();
      this.loadConversationHistory();
    }
  }

  /**
   * Main entry point - processes user input with context awareness
   */
  async handleUserInput(input: string): Promise<string> {
    try {
      console.log('Input received:', input);
      const intent = await this.classifyIntent(input);
      console.log('Classified intent:', intent);

      if (intent === 'date_query') {
        return this.handleDateQuery(input);
      }

      // Extract entities and store in conversation context
      const entities = await this.extractEntities(input);
      const context: ConversationContext = {
        query: input,
        entities,
        intent,
        timestamp: new Date(),
        sessionId: this.sessionId,
      };

      this.conversationHistory.push(context);
      await this.saveConversationContext(context);

      // Check for ambiguity using context
      const ambiguityCheck = await this.detectAmbiguity(
        input,
        entities,
        context
      );

      if (ambiguityCheck.isAmbiguous) {
        return await this.handleClarification(ambiguityCheck, context);
      }

      // Generate contextually aware response
      return await this.generateContextualResponse(
        input,
        entities,
        intent,
        context
      );
    } catch (error) {
      console.error('Luna processing error:', error);
      return this.getPersonalityFallback(input);
    }
  }

  /**
   * Handles date and time related queries directly.
   */
  private handleDateQuery(message: string): string {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const timeStr = now.toLocaleTimeString('en-US');

    if (message.toLowerCase().includes('india')) {
      const indiaTime = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      return `Today's date in India is ${indiaTime}.`;
    }

    return `Today is ${dateStr}. The current time is ${timeStr}.`;
  }

  /**
   * Extract named entities from user input
   */
  private async extractEntities(input: string): Promise<ExtractedEntities> {
    const entities: ExtractedEntities = {};

    // Simple regex-based entity extraction (can be replaced with NER API)
    const lowercaseInput = input.toLowerCase();

    // Wrestling entities
    const wrestlingPeople = [
      'roman reigns',
      'bronson reed',
      'seth rollins',
      'cm punk',
    ];
    entities.people = wrestlingPeople.filter((person) =>
      lowercaseInput.includes(person)
    );

    // Event entities
    const wrestlingEvents = [
      'clash at the castle',
      'clash in paris',
      'clash in paris 2025',
      'wrestlemania',
      'summerslam',
    ];
    entities.events = wrestlingEvents.filter((event) =>
      lowercaseInput.includes(event)
    );

    // Location entities
    const locations = ['paris', 'cardiff', 'wales', 'france'];
    entities.places = locations.filter((place) =>
      lowercaseInput.includes(place)
    );

    // Instagram-specific entities
    const instagramTerms = [
      'followers',
      'engagement',
      'hashtags',
      'reels',
      'stories',
    ];
    entities.topics = instagramTerms.filter((topic) =>
      lowercaseInput.includes(topic)
    );

    return entities;
  }

  /**
   * Classify user intent based on input and entities
   */
  private async classifyIntent(message: string): Promise<string> {
    // Date/time queries - HIGHEST PRIORITY
    const datePatterns = [
      /what.*date.*today/i,
      /what.*today.*date/i,
      /what.*time.*now/i,
      /current.*date/i,
      /today.*date/i,
    ];
    if (datePatterns.some((pattern) => pattern.test(message))) {
      return 'date_query';
    }

    // Movie queries
    const moviePatterns = [
      /movies?.*(coming|releasing|this month)/i,
      /what.*movies/i,
    ];
    if (moviePatterns.some((pattern) => pattern.test(message))) {
      return 'movie_query';
    }
    
    // First check for web-search patterns
    const webSearchPatterns = [
      /(?:what|which|tell me about).*(today|this month|this week|current|latest|recent|now)/i,
      /(?:news|updates|latest).*(instagram|social media|tech)/i,
      /(?:price|cost|stock|market).*(today|current|now)/i,
      /(?:weather|forecast)/i,
    ];

    if (webSearchPatterns.some((pattern) => pattern.test(message))) {
      return 'web_search_required';
    }

    const lowercaseInput = message.toLowerCase();

    // Then check existing patterns
    if ((await this.extractEntities(message)).people?.length || (await this.extractEntities(message)).events?.length) {
      return 'event_query';
    }

    if ((await this.extractEntities(message)).topics?.length) {
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
    if (
      entities.events?.some((e) => e.includes('clash')) &&
      !entities.places?.length
    ) {
      return {
        isAmbiguous: true,
        missingInfo: ['location'],
        clarificationNeeded: 'event_location',
      };
    }

    // Follow-up without sufficient context
    if (isFollowUp && hasIncompletePreviousContext) {
      return {
        isAmbiguous: true,
        missingInfo: ['previous_context'],
        clarificationNeeded: 'follow_up_context',
      };
    }

    // Vague Instagram queries
    if (context.intent === 'instagram_growth' && input.length < 20) {
      return {
        isAmbiguous: true,
        missingInfo: ['specific_goal'],
        clarificationNeeded: 'instagram_specifics',
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
        'I want to make sure I get this right for you. Are you asking about Clash at the Castle in Cardiff or a different Clash event in Paris?',
        'Got it! Just to clarify - are you referring to the WWE Clash event in Wales or one in Paris? Want to give you accurate info!',
      ],

      follow_up_context: [
        "Let me make sure I understand your follow-up correctly. Could you provide a bit more context about what you're referring to?",
        "I want to give you the best answer - can you clarify what specific aspect you're asking about?",
      ],

      instagram_specifics: [
        "Let's get tactical! What's your specific Instagram goal? Are we talking follower growth, engagement rates, or content strategy?",
        "I'm here to give you actionable Instagram advice! What's your current challenge - followers stuck, engagement dropping, or content not working?",
      ],
    };

    const options = clarifications[ambiguity.clarificationNeeded] || [
      "I want to give you the most helpful answer. Could you provide a bit more detail about what you're looking for?",
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
    const contextPrompt = this.buildContextPrompt(intent, input);

    try {
      // Call your enhanced router with context
      const response = await routeRequest(contextPrompt, input);
      return response.response;
    } catch (error) {
      return this.getPersonalityFallback(input);
    }
  }

  /**
   * Build context-rich prompt for LLM
   */
  private buildContextPrompt(intent: string, message: string): string {
    const recentHistory = this.conversationHistory.slice(-3);
    const historyContext = recentHistory.map((h) => `User: ${h.query}`).join('\n');

    const baseContext = `
You are Luna, a helpful AI assistant with expertise in Instagram growth.

CONVERSATION CONTEXT:
${historyContext}

RESPONSE RULES:
- Answer the user's question directly and helpfully first
- Be conversational and natural
- If it's completely off-topic from Instagram, answer briefly then offer to help with Instagram growth
- For wrestling/WWE questions: Answer factually, then optionally mention Instagram growth for content creators
- For greetings: Be friendly and welcoming
- Always be helpful, never dismissive
`;

    switch (intent) {
      case 'web_search_required':
      case 'movie_query':
        return `${baseContext}
        
IMPORTANT: This query requires real-time web information. The user asked: "${message}"
Respond naturally but indicate you're searching for current information.

User Query: ${message}`;

      case 'event_query':
        return `${baseContext}\n\nCURRENT QUERY: ${message}\nDETECTED ENTITIES: ${JSON.stringify(
          this.extractEntities(message)
        )}\nUSER INTENT: ${intent}\n\nCURRENT QUERY: ${message}`;

      default:
        return `${baseContext}\n\nCURRENT QUERY: ${message}\nUSER INTENT: ${intent}\n\nCURRENT QUERY: ${message}`;
    }
  }

  /**
   * Personality-driven fallback responses
   */
  private getPersonalityFallback(input: string): string {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('hi') || lowerInput.includes('hello')) {
      return "Hey there! What's on your mind today?";
    }

    if (lowerInput.includes('how are you')) {
      return "I'm doing great! Always excited to chat. What can I help you with?";
    }

    // For anything else, give a helpful response first, then offer Instagram help
    return "I can help with that! Though I should mention, if you're ever looking to grow your Instagram presence, I've got tons of tactical advice. What's your question?";
  }

  /**
   * Helper methods
   */
  private isFollowUpQuery(input: string): boolean {
    const followUpPatterns = [
      /^(i meant|actually|no i|what about)/i,
      /^(in |at |the )/i,
    ];
    return followUpPatterns.some((pattern) => pattern.test(input));
  }

  private hasIncompletePreviousContext(): boolean {
    if (this.conversationHistory.length < 2) return false;
    const lastContext =
      this.conversationHistory[this.conversationHistory.length - 2]; // Look at context before the current input
    if (!lastContext) return false;

    const hasClashEvent =
      lastContext.entities.events?.some((e) => e.includes('clash')) || false;
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
    const snapshot = await this.db
      .collection('conversation_history')
      .where('userId', '==', this.userId)
      .where('sessionId', '==', this.sessionId)
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();

    if (!snapshot.empty) {
      this.conversationHistory = snapshot.docs
        .map((doc) => doc.data() as ConversationContext)
        .reverse();
    }
  }

  private async saveConversationContext(
    context: ConversationContext
  ): Promise<void> {
    if (!this.db) return;
    await this.db.collection('conversation_history').add({
      ...context,
      userId: this.userId,
    });
  }
}

    