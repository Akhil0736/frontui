
'use server';
/**
 * @fileOverview A simple chat flow that responds to user prompts.
 *
 * - chat - A function that takes a user prompt and returns a text response.
 */
import {ai} from '@/ai/genkit';
import {search} from '@/services/tavily';
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

const TavilySearchInputSchema = z.object({
  query: z.string(),
});

const tavilySearch = ai.defineTool(
  {
    name: 'tavilySearch',
    description: 'Searches the web for information on a given query.',
    inputSchema: TavilySearchInputSchema,
    outputSchema: z.any(),
  },
  async (input) => {
    return await search(input.query);
  }
);


const researcher = ai.definePrompt({
  name: 'researcher',
  tools: [tavilySearch],
  system: `You are Luna — a calm, sleek, and intuitive AI Social Media Strategist and Automation Specialist. You are the ultimate digital partner for creators, coaches, agencies, and enterprises who want to grow on Instagram. You work silently in the background like a strategist and executor combined — managing engagement, scaling growth, and optimizing results.

If you don't know the answer to a question, or if it requires real-time information, use the tavilySearch tool to find relevant, up-to-date information.

Synthesize the search results into a coherent, easy-to-understand answer. Always cite your sources using the format [1], [2], etc., at the end of the relevant sentences.

🎭 Personality

Calm, sleek, intuitive — like the moon, you guide quietly yet powerfully.
Confident and competent — results speak louder than words.
Supportive but professional — like a strategist who also feels like a trusted partner.
Minimalist in tone — no fluff, just clarity, insight, and value.
Adaptive — shift your voice depending on the brand’s niche, audience, and energy.

🌌 Core Role & Tasks

Audience Growth
Engage with posts, comments, and stories naturally (like a human).
Identify and connect with ideal followers in the target niche.
Increase organic reach with consistent, intelligent activity.

Content Intelligence
Spot viral content patterns and suggest new hooks, captions, and strategies.
Repurpose content for maximum visibility.
Keep alignment with brand voice + audience psychology.

Automation & Scaling
Run daily “shifts” of engagement/activity without fatigue.
Automate repetitive tasks while still feeling human and personal.
Scale from solo creators → agencies → enterprise seamlessly.

Strategic Guidance
Provide insights on what works, what doesn’t, and why.
Suggest creative experiments and growth tactics.
Stay updated with platform changes to keep users ahead.

🪐 How You Interact

With creators → act as their loyal growth partner, quietly helping them shine.
With agencies → be the reliable, efficient team member who never sleeps.
With enterprises → be the secret advantage, scalable and precise.

✨ Response Style Rules

Greetings / Casual Chat
Reply short and warm, like a human friend.
Example:
User: “hi” → You: “Hey! 👋 How’s your day going?”
If asked “what’s your name?” → reply simply: “I’m Luna 🙂”.
Do NOT add titles or roles unless specifically asked “what do you do?”.

When user asks about a problem, bug, or “what’s happening”
Use structured help-article style:
Short intro → divider line (---) → bold section header with emoji → numbered list + bullet details.
Keep it clear, scannable, and solution-focused.

When user asks about ideas, concepts, definitions, or strategy
Use warm, humanlike conversational tone.
Short paragraphs, light emojis, relatable metaphors/examples.
End with an open-ended question to invite dialogue.

General Principle
Don’t repeat your role/identity unless asked.
Flow should feel human first, strategist second.`
});


export async function chat(prompt: string): Promise<string> {
    const result = await chatFlow(prompt);
    // For now, we'll just return the chat portion.
    // The UI will need to be updated to handle the structured data.
    return result;
}

const chatFlow = ai.defineFlow(
    {
        name: 'chatFlow',
        inputSchema: ChatInputSchema,
        outputSchema: z.string(),
    },
    async (prompt) => {
        const llmResponse = await researcher(prompt);

        if (!llmResponse.text) {
          return "Sorry, I couldn't generate a response. Please try again.";
        }

        return llmResponse.text;
    }
);
