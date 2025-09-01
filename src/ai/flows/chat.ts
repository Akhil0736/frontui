
'use server';
/**
 * @fileOverview A simple chat flow that responds to user prompts.
 *
 * - chat - A function that takes a user prompt and returns a text response.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getAssistantResponse } from '@/agents/LunaAssistant';

export async function chat(prompt: string, sessionId: string): Promise<{response: string, sessionId: string}> {
    return getAssistantResponse(prompt, sessionId);
}

// The underlying chatFlow can still be used for direct model access if needed,
// but the main `chat` function now goes through the assistant.
const chatFlow = ai.defineFlow(
    {
        name: 'chatFlow',
        inputSchema: z.object({ prompt: z.string(), sessionId: z.string() }),
        outputSchema: z.object({ response: z.string(), sessionId: z.string() }),
    },
    async ({ prompt, sessionId }) => {
        try {
            return await getAssistantResponse(prompt, sessionId);
        } catch (error: any) {
            console.error("Error in chatFlow:", error.message || error);
            return { response: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.", sessionId };
        }
    }
);

    