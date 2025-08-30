
'use server';
/**
 * @fileOverview A simple chat flow that responds to user prompts.
 *
 * - chat - A function that takes a user prompt and returns a text response.
 */
import {ai} from '@/ai/genkit';
import {z} from 'zod';

const ChatInputSchema = z.string();
const ChatOutputSchema = z.string();

export async function chat(prompt: string): Promise<string> {
    return chatFlow(prompt);
}

const chatFlow = ai.defineFlow(
    {
        name: 'chatFlow',
        inputSchema: ChatInputSchema,
        outputSchema: ChatOutputSchema,
    },
    async (prompt) => {
        const llmResponse = await ai.generate({
            prompt: prompt,
            model: 'googleai/gemini-2.5-flash',
            config: {
                // Adjust temperature for more creative responses
                temperature: 0.7,
            },
        });

        return llmResponse.text;
    }
);
