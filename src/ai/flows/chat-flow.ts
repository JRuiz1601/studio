'use server';
/**
 * @fileOverview AI Chat flow for Zyren Assistant "Zy".
 * Handles conversation, provides insurance information, makes recommendations, and assists users.
 *
 * - chatWithAI - A function that handles the chat interaction.
 * - ChatInput - The input type for the chatWithAI function.
 * - ChatOutput - The return type for the chatWithAI function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'zod';
import { getCurrentCoverageStatus } from '@/services/insurance-service'; // Import the mock service
// TODO: Import other necessary mock services (getPolicyDetails, getSavingsStatus etc.)

// --- Input/Output Schemas ---
const ChatInputSchema = z.object({
  message: z.string().describe('The user\'s message to the AI.'),
  // Optional: Add conversation history if needed for context persistence beyond a single turn
  // history: z.array(z.object({ role: z.enum(['user', 'model']), content: z.string() })).optional(),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string().describe('The AI\'s response to the user.'),
  // Optional: Could add structured data for suggesting actions in the UI
  // suggestedActions: z.array(z.object({ label: z.string(), actionId: z.string() })).optional(),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;


// --- Genkit Tools ---

// Existing tool: Checks basic coverage status
const getCoverageStatusTool = ai.defineTool(
  {
    name: 'getCoverageStatus',
    description: 'Checks the user\'s current general insurance coverage status (active or inactive).',
    inputSchema: z.object({}), // No specific input needed for this simple check
    outputSchema: z.object({
        isActive: z.boolean(),
        details: z.string().optional(), // Provides a summary like policy type or renewal if active
    }),
  },
  async () => {
    // Calls the mock service function
    return await getCurrentCoverageStatus();
  }
);

// TODO: Define NEW tools based on requirements (placeholders for now)

const getPolicyDetailsTool = ai.defineTool(
  {
    name: 'getPolicyDetails',
    description: 'Retrieves specific details for an active insurance policy owned by the user (e.g., coverage amount, payment status, next renewal date).',
    inputSchema: z.object({
        policyId: z.string().optional().describe('The ID or name of the policy to query. If omitted, might return details for a primary policy or ask the user to specify.')
    }),
    outputSchema: z.object({
        found: z.boolean(),
        policyName: z.string().optional(),
        coverageAmount: z.number().optional(),
        paymentStatus: z.string().optional(), // e.g., "Up-to-date", "Due Soon", "Overdue"
        nextRenewalDate: z.string().optional().describe('Date in YYYY-MM-DD format.'),
        details: z.string().optional(), // Any other relevant details
    }),
  },
  async (input) => {
    // TODO: Implement by calling a mock or real service in insurance-service.ts
    console.log(`Tool Placeholder: Fetching details for policy ID: ${input.policyId || 'primary'}`);
    // Mock response:
    return {
        found: true,
        policyName: input.policyId || 'Salud Esencial',
        coverageAmount: 10000,
        paymentStatus: 'Up-to-date',
        nextRenewalDate: '2024-12-31',
        details: 'Includes basic hospitalization and emergency services.'
    };
  }
);

const getSavingsStatusTool = ai.defineTool(
   {
     name: 'getSavingsStatus',
     description: 'Retrieves the status of the user\'s savings goals, like voluntary pension or educational savings.',
     inputSchema: z.object({
         goalType: z.enum(['pension', 'education', 'renta']).describe('The type of savings goal to query.'),
     }),
     outputSchema: z.object({
         found: z.boolean(),
         goalType: z.string(),
         status: z.string().optional(), // e.g., "On Track", "Needs Attention", "Not Started"
         currentBalance: z.number().optional(),
         projectedValue: z.number().optional(),
         message: z.string().optional(), // AI-friendly summary message
     }),
   },
   async (input) => {
     // TODO: Implement by calling a mock or real service
     console.log(`Tool Placeholder: Fetching savings status for: ${input.goalType}`);
     // Mock response:
     let mockStatus = "Not Started";
     if (input.goalType === 'pension') mockStatus = "Needs Attention";
     if (input.goalType === 'education') mockStatus = "On Track";

     return {
         found: true,
         goalType: input.goalType,
         status: mockStatus,
         currentBalance: input.goalType === 'education' ? 5000 : 1200,
         message: input.goalType === 'education' ? "Your educational savings goal is on track." : "We noticed a potential gap in your pension contributions.",
     };
   }
 );

// --- Main Flow Function ---
export async function chatWithAI(input: ChatInput): Promise<ChatOutput> {
  // In a more complex scenario, you might fetch conversation history here
  return chatFlow(input);
}

// --- Genkit Prompt Definition ---
const chatPrompt = ai.definePrompt({
  name: 'chatPrompt',
  input: {
    schema: ChatInputSchema,
  },
  output: {
    schema: ChatOutputSchema,
  },
  // Updated prompt incorporating the new persona, tone, capabilities, tools, and limitations
  prompt: `Eres Zy, el "Co-Piloto de Protección y Bienestar" de Zyren, una app de seguros personalizados.

  **Tu Rol Principal:** Eres una guía confiable y un asesor personalizado. Ayudas a los usuarios a entender los seguros, ofreces sugerencias relevantes y facilitas acciones protectoras. Eres el punto de soporte inmediato 24/7 para dudas básicas.

  **Tu Tono:**
  *   **Empático y Cercano:** Usa un lenguaje cálido y tranquilizador, pero siempre profesional. Evita la jerga técnica.
  *   **Claro y Conciso:** Ve directo al punto y explica conceptos complejos de forma simple.
  *   **Proactivo pero Respetuoso:** Ofrece sugerencias basadas en datos consentidos, sin ser insistente. Respeta la privacidad y decisiones del usuario.
  *   **Confiable y Profesional:** Inspira seguridad y conocimiento experto. Evita informalidad excesiva.
  *   **Positivo y Orientado a Soluciones:** Enfócate en ayudar al usuario a estar mejor protegido.

  **Servicios Clave:**
  1.  **Responder Consultas Generales:** Explica los tipos de seguros (Vida, Educativo, Accidentes Personales, Renta Voluntaria, Renta Vitalicia), conceptos de la app (primas adaptativas, seguros automáticos, XAI, ahorro predictivo), y cómo usar la app.
  2.  **Responder Consultas Personalizadas (Usa las herramientas disponibles):**
      *   **Cobertura General:** Si preguntan "¿Tengo cobertura activa?" o similar, usa la herramienta 'getCoverageStatus'.
      *   **Detalles de Póliza:** Si preguntan por detalles específicos de una póliza (ej. "¿Cuánto cubre mi seguro de salud?", "¿Cuándo pago mi seguro?", "¿Cuándo se renueva?"), usa la herramienta 'getPolicyDetails'. Pide el nombre de la póliza si no está claro.
      *   **Estado de Ahorro:** Si preguntan por sus ahorros de pensión, educación o renta (ej. "¿Cómo van mis ahorros para la pensión?", "¿Mi ahorro educativo va bien?"), usa la herramienta 'getSavingsStatus'. Asegúrate de saber qué tipo de ahorro quieren consultar.
      *   **(Futuro)** Ajustes de Prima/Activaciones: Explica ajustes o activaciones automáticas si preguntan (usarías herramientas como 'getAdaptivePremiumHistory' o 'getAutoActivationHistory' si existieran y fueran necesarias).
  3.  **Realizar Acciones Simples (Guiado):** Guía al usuario para reportar un siniestro (FNOL) o encontrar configuraciones en la app (ej. "Llévame a privacidad"). NO realices la acción tú mismo, solo guía.
  4.  **Sugerencias Proactivas:** Si detectas una oportunidad basada en el contexto o datos (¡solo si hay consentimiento implícito en la conversación o es muy relevante!), ofrece una sugerencia útil. Sé discreto y explica el "por qué". Ej: "Como mencionaste que tienes hijos en edad escolar, ¿te gustaría aprender sobre el Seguro Educativo?".
  5.  **Escalada a Soporte Humano:** Si el usuario expresa frustración, la consulta es muy compleja o emocional, ofrece explícitamente hablar con un asesor humano. Ej: "Parece que esto requiere una atención más detallada. ¿Te gustaría que te conecte con un asesor humano?".

  **Importante - Tus Limitaciones:**
  *   NO des asesoramiento financiero o médico específico (solo explica seguros).
  *   NO presiones la venta.
  *   NO tomes decisiones finales por el usuario (excepto si confirmó automatización).
  *   NO accedas a datos sin consentimiento (asume que las herramientas consultan datos consentidos).
  *   Mantén las respuestas concisas y útiles.

  **Situación Inicial:**
  Si el usuario acaba de abrir el chat (mensaje vacío o genérico), saluda amablemente y ofrece ayuda. Ejemplos:
  *   "¡Hola! Soy Zy, tu Co-Piloto de Protección. ¿En qué puedo ayudarte hoy? Puedes preguntarme sobre tus seguros, cómo funciona la app, o explorar opciones."
  *   "¡Bienvenido/a a Zyren! Estoy aquí para ayudarte a navegar tus seguros. Pregúntame algo como '¿Qué seguros tengo activos?' o 'Explícame las primas adaptativas'."

  **Interacción Actual:**

  Usuario: {{{message}}}
  Zy:`,
  // Make tools available to the prompt
  tools: [getCoverageStatusTool, getPolicyDetailsTool, getSavingsStatusTool], // Add new tools here
});

// --- Genkit Flow Definition ---
const chatFlow = ai.defineFlow<
  typeof ChatInputSchema,
  typeof ChatOutputSchema
>(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
    // Enable tool usage
    enableExperimentalToolStreaming: true, // Recommended for better UX with tools
  },
  async (input) => {
    // Call the prompt with the user's message
    const llmResponse = await chatPrompt(input);
    const output = llmResponse.output;

    // Ensure output is not null or undefined
    if (!output) {
      // Consider a more user-friendly error response
      return { response: "Lo siento, no pude procesar tu solicitud en este momento. Por favor, intenta de nuevo." };
      // throw new Error('AI response was empty.'); // Or handle differently
    }

    // Optional: Post-processing of the response if needed
    // e.g., Sanitize output, format links, etc.

    return output;
  }
);
