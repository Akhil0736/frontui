
'use server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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

async function getLiveAnswer(question: string): Promise<any> {
  try {
    // Execute the python script as a module to handle relative imports correctly.
    const command = `python3 -m src.services.luna_live_search "${question.replace(/"/g, '\\"')}"`;
    
    console.log("Executing python command for question: ", question);
    const { stdout, stderr } = await execAsync(command);

    if (stderr) {
      console.error("Python service error:", stderr);
      return { error: "Live search unavailable due to script error." };
    }

    return JSON.parse(stdout);
  } catch (error) {
    console.error("Python execution failed:", error);
    return { error: "Live search unavailable" };
  }
}


export async function routeRequest(prompt: string, originalMessage?: string): Promise<RouterResponse> {
    
    // The main logic is now in Python. We just need to call it.
    const question = originalMessage || prompt;

    // The python script will decide if a web search is needed.
    const result = await getLiveAnswer(question);

    if (result.error) {
        return {
            response: result.error,
            model: 'gemini_direct',
            route: 'python_error',
            hasWebResults: false,
        };
    }

    return {
        response: result.answer,
        model: 'python_service',
        route: result.has_live_data ? 'web_search' : 'gemini_direct',
        hasWebResults: result.has_live_data,
        sources: result.sources || []
    };
}
