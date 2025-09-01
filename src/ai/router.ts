
'use server';
import { answerWithLiveSearch } from '@/services/lunaLiveSearch';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface RouterResponse {
  response: string;
  model: string;
  route: string;
  fallback?: 'backup' | 'emergency';
  sources?: any[];
  hasWebResults?: boolean;
}

async function standardGeminiCall(prompt: string): Promise<RouterResponse> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(prompt);
  return {
    response: result.response.text(),
    model: 'gemini-1.5-flash',
    route: 'direct',
    hasWebResults: false,
    sources: [],
  };
}

export async function routeRequest(
  prompt: string,
  originalMessage?: string
): Promise<RouterResponse> {
  const question = originalMessage || prompt;

  // Check if the prompt from the assistant signals a web search is needed
  if (prompt.includes('IMPORTANT: This query requires real-time web information')) {
    // Extract the original, unmodified user question
    const questionMatch = prompt.match(/The user asked: "([^"]+)"/);
    const originalQuestion = questionMatch ? questionMatch[1] : question;

    if (originalQuestion) {
      try {
        const result = await answerWithLiveSearch(originalQuestion);
        return {
          response: result.answer,
          model: 'gemini-tavily',
          route: result.has_live_data ? 'web_search' : 'direct',
          hasWebResults: result.has_live_data,
          sources: result.sources,
        };
      } catch (error) {
        console.error('Live search failed:', error);
        return {
          response:
            'I encountered an issue processing your request. Please try again.',
          model: 'error',
          route: 'fallback',
          hasWebResults: false,
          sources: [],
        };
      }
    }
  }

  // If no web search signal, perform a standard Gemini call with the full prompt
  return standardGeminiCall(prompt);
}

    