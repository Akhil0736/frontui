
'use server';
import { answerWithLiveSearch } from "@/services/lunaLiveSearch";

interface RouterResponse {
  response: string;
  model: string;
  route: string;
  fallback?: 'backup' | 'emergency';
  sources?: any[];
  hasWebResults?: boolean;
}

export async function routeRequest(prompt: string, attachments: any[] = [], context: any[] = []): Promise<RouterResponse> {
    
    const needsWebSearch = /(today|latest|news|current|recent|this month|this year|2025|movies?|weather)/i.test(prompt);

    const result = await answerWithLiveSearch(prompt);
    
    return {
        response: result,
        model: 'gemini-1.5-flash',
        route: needsWebSearch ? 'web_search' : 'gemini_direct',
        sources: [], // This could be enhanced to return sources from Tavily
        hasWebResults: needsWebSearch,
    };
}
