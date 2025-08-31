
'use server';
/**
 * @fileOverview A simple chat flow that responds to user prompts.
 *
 * - chat - A function that takes a user prompt and returns a text response.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { routeRequest } from '@/ai/router';

const ChatInputSchema = z.string();

export async function chat(prompt: string): Promise<string> {
    const result = await chatFlow(prompt);
    return result;
}

const chatFlow = ai.defineFlow(
    {
        name: 'chatFlow',
        inputSchema: ChatInputSchema,
        outputSchema: z.string(),
    },
    async (prompt) => {
        try {
            const result = await routeRequest(prompt);
            return result.response || "I'm sorry, I encountered an issue while processing your request.";
        } catch (error) {
            console.error("Error in EnhancedLunaRouter flow:", error);
            return "I'm sorry, I'm having trouble responding right now. Please try again in a moment.";
        }
    }
);
