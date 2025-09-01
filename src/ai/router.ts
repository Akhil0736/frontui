
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

export async function routeRequest(prompt: string, originalMessage?: string): Promise<RouterResponse> {
  const question = originalMessage || prompt;
  
  try {
    const result = await answerWithLiveSearch(question);
    
    return {
      response: result.answer,
      model: 'gemini-tavily',
      route: result.has_live_data ? 'web_search' : 'direct',
      hasWebResults: result.has_live_data,
      sources: result.sources
    };
  } catch (error) {
    console.error("Live search failed:", error);
    return {
      response: "I encountered an issue processing your request. Please try again.",
      model: 'error',
      route: 'fallback',
      hasWebResults: false,
      sources: []
    };
  }
}
