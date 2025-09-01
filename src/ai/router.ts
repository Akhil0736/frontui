
'use server';
import { answerLuna } from "@/services/lunaAnswer";

interface RouterResponse {
  response: string;
  model: string;
  route: string;
  fallback?: 'backup' | 'emergency';
  sources?: any[];
  hasWebResults?: boolean;
}

export async function routeRequest(prompt: string, attachments: any[] = [], context: any[] = []): Promise<RouterResponse> {
    const result = await answerLuna(prompt);
    
    return {
        response: result.answer,
        model: 'gemini-1.5-flash', // Model is now hardcoded in gemini.ts
        route: result.hasWebResults ? 'web_search' : 'gemini_direct',
        sources: result.sources,
        hasWebResults: result.hasWebResults,
    };
}
