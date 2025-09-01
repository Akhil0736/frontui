'use server';
/**
 * @fileOverview A simple chat flow that responds to user prompts.
 *
 * - chat - A function that takes a user prompt and returns a text response.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { routeRequest } from '@/ai/router';
import { LunaAssistant } from '@/agents/LunaAssistant';

const ChatInputSchema = z.string();

// This is a simplified example of session management. In a real app, you'd manage this more robustly.
const assistants: Record<string, LunaAssistant> = {};

function getAssistant(sessionId: string): LunaAssistant {
    if (!assistants[sessionId]) {
        console.log("Creating new assistant for session:", sessionId);
        assistants[sessionId] = new LunaAssistant('user-123', sessionId);
    } else {
        console.log("Using existing assistant for session:", sessionId);
    }
    return assistants[sessionId];
}


export async function chat(prompt: string, sessionId: string): Promise<{response: string, sessionId: string}> {
    const assistant = getAssistant(sessionId);
    const result = await assistant.handleUserInput(prompt);
    return { response: result, sessionId: assistant.sessionId };
}

// The underlying chatFlow can still be used for direct model access if needed,
// but the main `chat` function now goes through the assistant.
const chatFlow = ai.defineFlow(
    {
        name: 'chatFlow',
        inputSchema: z.object({ prompt: ChatInputSchema, sessionId: z.string() }),
        outputSchema: z.object({ response: z.string(), sessionId: z.string() }),
    },
    async ({ prompt, sessionId }) => {
        try {
            const assistant = getAssistant(sessionId);
            const result = await assistant.handleUserInput(prompt);
            return { response: result, sessionId: assistant.sessionId };
        } catch (error: any) {
            console.error("Error in chatFlow:", error.message || error);
            return { response: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.", sessionId };
        }
    }
);
