'use server';
/**
 * @fileOverview Simple AI chat flow.
 *
 * - chatWithAI - A function that handles the chat interaction.
 * - ChatInput - The input type for the chatWithAI function.
 * - ChatOutput - The return type for the chatWithAI function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'zod';

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
  // Basic prompt, can be enhanced with persona, instructions, history etc.
  prompt: `You are Zy, a helpful AI assistant for Zyren, a personalized insurance app. Keep your responses concise and helpful.

User: {{{message}}}
AI:`,
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
