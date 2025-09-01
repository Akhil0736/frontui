
'use server';
import { answerWithLiveSearch } from "@/services/lunaLiveSearch";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface RouterResponse {
  response: string;
  model: string;
  route: string;
  fallback?: 'backup' | 'emergency';
  sources?: any[];
  hasWebResults?: boolean;
}

async function generateWithGemini(prompt: string) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text();
}

export async function routeRequest(prompt: string, originalMessage?: string): Promise<RouterResponse> {
    
    // Check if this is a web search request signaled by the assistant
    if (prompt.includes('IMPORTANT: This query requires real-time web information')) {
        // Extract the original question
        const questionMatch = prompt.match(/The user asked: "([^"]+)"/);
        const originalQuestion = questionMatch?.[1] || originalMessage || '';
        
        if (originalQuestion) {
            const result = await answerWithLiveSearch(originalQuestion);
            return {
                response: result,
                model: 'gemini-1.5-flash-tavily',
                route: 'web_search',
                hasWebResults: true,
            };
        }
    }

    // Fallback for direct calls or if signal is missing
    const needsWebSearch = /(today|latest|news|current|recent|this month|movies?|weather)/i.test(originalMessage || prompt);

    if (needsWebSearch) {
        const result = await answerWithLiveSearch(originalMessage || prompt);
        return {
            response: result,
            model: 'gemini-1.5-flash-tavily',
            route: 'web_search_fallback',
            hasWebResults: true,
        };
    }
    
    // Default to Gemini if no web search is needed
    const result = await generateWithGemini(prompt);
    return {
        response: result,
        model: 'gemini-1.5-flash',
        route: 'gemini_direct',
        hasWebResults: false,
    };
}
