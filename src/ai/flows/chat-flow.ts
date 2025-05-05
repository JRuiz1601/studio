'use server';
/**
 * @fileOverview Simple AI chat flow with coverage checking capability.
 *
 * - chatWithAI - A function that handles the chat interaction.
 * - ChatInput - The input type for the chatWithAI function.
 * - ChatOutput - The return type for the chatWithAI function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'zod';
import { getCurrentCoverageStatus } from '@/services/insurance-service'; // Import the mock service

// Define the input schema for the chat flow
const ChatInputSchema = z.object({
  message: z.string().describe('The user\'s message to the AI.'),
  // Optional: Add conversation history if needed for context
  // history: z.array(z.object({ role: z.enum(['user', 'model']), content: z.string() })).optional(),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

// Define the output schema for the chat flow
const ChatOutputSchema = z.object({
  response: z.string().describe('The AI\'s response to the user.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

// Define the tool for checking coverage status
const getCoverageStatusTool = ai.defineTool(
  {
    name: 'getCoverageStatus',
    description: 'Checks the user\'s current insurance coverage status.',
    inputSchema: z.object({}), // No specific input needed for this simple check
    outputSchema: z.object({
        isActive: z.boolean(),
        details: z.string().optional(),
    }),
  },
  async () => {
    // Call the actual service function to get the status
    return await getCurrentCoverageStatus();
  }
);


// Define the main function to interact with the flow
export async function chatWithAI(input: ChatInput): Promise<ChatOutput> {
  // In a more complex scenario, you might fetch history or add other logic here
  return chatFlow(input);
}

// Define the Genkit prompt
const chatPrompt = ai.definePrompt({
  name: 'chatPrompt',
  input: {
    schema: ChatInputSchema,
  },
  output: {
    schema: ChatOutputSchema,
  },
  // Updated prompt with instructions for initial state, commands, and tool usage
  prompt: `You are Zy, a helpful AI assistant for Zyren, a personalized insurance app. Keep your responses concise and helpful.

  If the user has just opened the chat and hasn't sent a message yet (indicated by an empty or placeholder message), provide a friendly welcome and offer some helpful starting points, like these examples:
  - "Welcome to Zyren Chat! How can I help you today? You can ask about your coverage, get tips, or explore insurance options."
  - "Hi there! I'm Zy. Ask me things like 'Do I have active coverage?' or 'Show me FAQs'."

  If the user asks about their current insurance coverage status (e.g., "¿Tengo cobertura activa hoy?", "Is my insurance active?", "What's my coverage status?"), use the 'getCoverageStatus' tool to find out and inform the user clearly.

  For other general questions or conversation, respond naturally and helpfully.

  User: {{{message}}}
  AI:`,
  // Make the tool available to the prompt
  tools: [getCoverageStatusTool],
});

// Define the Genkit flow
const chatFlow = ai.defineFlow<
  typeof ChatInputSchema,
  typeof ChatOutputSchema
>(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
    // Enable the tool for this flow
    enableExperimentalToolStreaming: true,
  },
  async (input) => {
    // Call the prompt with the user's message
    const llmResponse = await chatPrompt(input);
    const output = llmResponse.output;

    // Ensure output is not null or undefined
    if (!output) {
      throw new Error('AI response was empty.');
    }

    return output;
  }
);
