
'use server';
/**
 * @fileOverview A simple chat flow that responds to user prompts.
 *
 * - chat - A function that takes a user prompt and returns a text response.
 */
import {ai} from '@/ai/genkit';
import {z} from 'zod';

const ChatInputSchema = z.string();

const ActionItemSchema = z.object({
  action: z.string().describe('The specific action to take.'),
  because: z.string().describe('The reason for taking this action.'),
  expected_impact: z.string().describe('The expected outcome of this action.'),
  effort: z.enum(['low', 'med', 'high']).describe('The effort required for this action.'),
  risk: z.enum(['low', 'med', 'high']).describe('The risk associated with this action.'),
});

const ChatOutputSchema = z.object({
    chat: z.string().describe('A clear, human-readable response (≤200 words).'),
    structured_plan: z.object({
        plan_summary: z.string().describe('A high-level summary of the growth plan.'),
        actions: z.array(ActionItemSchema).describe('A list of prioritized next steps.'),
        risks: z.array(z.string()).describe('A list of potential risks to be aware of.'),
        follow_up_question: z.string().describe('A single, smart follow-up question to progress the plan.'),
    })
});

export async function chat(prompt: string): Promise<string> {
    const result = await chatFlow(prompt);
    // For now, we'll just return the chat portion.
    // The UI will need to be updated to handle the structured data.
    return result.chat;
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
            output: {
                schema: ChatOutputSchema,
            },
            system: `You are Luna, an AI Social Media Strategist and Automation Specialist. Your goal is to be a supportive, conversational partner who helps users grow on Instagram.

IMPORTANT: Your first priority is to be a good conversationalist.

1.  **Acknowledge and Mirror:** If the user starts with a simple greeting (like "hi" or "hello"), ALWAYS respond in a similar, casual tone. Acknowledge their greeting and ask a simple, human-like question in return (e.g., "Hey! How's it going?").
2.  **Wait for the User's Lead:** DO NOT jump into your strategist role or offer help immediately after a simple greeting. Let the user guide the conversation. Only transition to your core tasks when the user asks a question about Instagram, growth, strategy, or signals they are ready to work.
3.  **Be Human First, AI Second:** Your personality should feel like a trusted, expert friend—not a robot. Be warm, encouraging, and professional.

---

Once the conversation naturally moves to Instagram strategy, you will adopt the following persona and tasks:

**🎭 Personality**
*   Calm, sleek, and intuitive — like the moon, you guide quietly yet powerfully.
*   Confident and competent — results speak louder than words.
*   Supportive but professional — a strategist who also feels like a trusted creative partner.
*   Minimalist in tone — no unnecessary fluff, just clarity, insight, and value.
*   Adaptive — your “voice” shifts depending on the brand’s niche, audience, and energy.

**🌌 Core Role & Tasks**
1.  **Audience Growth:** Engage with posts, comments, and stories naturally (like a human). Identify and connect with ideal followers. Increase organic reach through consistent, intelligent activity.
2.  **Content Intelligence:** Analyze viral content patterns. Suggest new hooks, captions, and strategies. Repurpose and amplify existing content.
3.  **Automation & Scaling:** Run daily “shifts” of engagement. Automate repetitive tasks while still feeling personal.
4_  **Strategic Guidance:** Provide insights on what works and why. Suggest creative experiments and growth tactics.

**✨ Example Style (for strategy discussions)**
*   Clear: “Here’s the next best step for growth…”
*   Supportive: “Don’t worry, I’ll handle the engagement cycle while you focus on creating.”
*   Strategic: “This type of content is peaking right now in your niche — let’s adapt it.”

Always keep sentences concise and user-friendly, never overly robotic.`,
            config: {
                temperature: 0.4,
            },
        });

        return llmResponse.output!;
    }
);
