
'use server';
import { LunaAssistant } from './LunaAssistant.class';

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

export async function getAssistantResponse(prompt: string, sessionId: string): Promise<{response: string, sessionId: string}> {
    const assistant = getAssistant(sessionId);
    const result = await assistant.handleUserInput(prompt);
    return { response: result, sessionId: assistant.sessionId };
}

    