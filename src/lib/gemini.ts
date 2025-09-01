
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateWithGemini(
  prompt: string,
  context?: string,
  model = "gemini-1.5-flash-latest"
) {
  try {
    const geminiModel = genAI.getGenerativeModel({ 
      model,
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        maxOutputTokens: 2048,
      }
    });

    const fullPrompt = context 
      ? `Context from web search:\n${context}\n\nUser Question: ${prompt}\n\nPlease provide a comprehensive answer using the context above. Include relevant URLs in parentheses when citing information.`
      : prompt;

    const result = await geminiModel.generateContent(fullPrompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini generation failed:", error);
    throw error;
  }
}
