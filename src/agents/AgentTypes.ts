
'use server';

export interface ConversationContext {
  query: string;
  entities: ExtractedEntities;
  intent: string;
  timestamp: Date;
  sessionId: string;
}

export interface ExtractedEntities {
  people?: string[];
  places?: string[];
  events?: string[];
  dates?: string[];
  topics?: string[];
}

export interface AmbiguitySignal {
  isAmbiguous: boolean;
  missingInfo?: string[];
  multipleMatches?: string[];
  clarificationNeeded: string;
}
