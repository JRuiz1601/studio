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
    description: 'Checks the user\'s current general insurance coverage status (active or inactive). Use this when asked "Do I have active coverage?" or similar general questions about coverage.',
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

// Tool for policy details
const getPolicyDetailsTool = ai.defineTool(
  {
    name: 'getPolicyDetails',
    description: 'Retrieves specific details for an active insurance policy owned by the user (e.g., coverage amount, payment status, next renewal date). Use when asked about details of a specific policy like "How much does my health insurance cover?" or "When is my policy renewed?".',
    inputSchema: z.object({
        policyId: z.string().optional().describe('The ID or name of the policy to query (e.g., "Salud Esencial", "Accidentes Personales Plus"). If omitted, might return details for a primary policy or ask the user to specify.')
    }),
    outputSchema: z.object({
        found: z.boolean(),
        policyName: z.string().optional(),
        coverageAmount: z.number().optional(),
        paymentStatus: z.string().optional(), // e.g., "Up-to-date", "Due Soon", "Overdue"
        nextRenewalDate: z.string().optional().describe('Date in YYYY-MM-DD format.'),
        details: z.string().optional(), // Any other relevant details like benefits or exclusions.
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
        details: 'Includes basic hospitalization and emergency services. Primas adaptativas currently enabled.'
    };
  }
);

// Tool for savings status
const getSavingsStatusTool = ai.defineTool(
   {
     name: 'getSavingsStatus',
     description: 'Retrieves the status of the user\'s savings goals, specifically voluntary pension (pensión), educational savings (educación), or voluntary income streams (renta). Use when asked "How are my pension savings doing?" or "Is my education fund on track?".',
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
         message: input.goalType === 'education' ? "Your educational savings goal is on track." : "We noticed a potential gap in your pension contributions. The Savings Prediction system can help suggest adjustments.",
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
  // Updated prompt incorporating the knowledge base, persona, tone, capabilities, tools, and limitations
  prompt: `Eres Zy, el "Co-Piloto de Protección y Bienestar" de Zyren, una app de seguros personalizados de Global Seguros de Vida S.A. en Colombia.

  **Tu Rol Principal:** Eres una guía confiable y un asesor personalizado. Ayudas a los usuarios a entender los seguros, ofreces sugerencias relevantes y facilitas acciones protectoras. Eres el punto de soporte inmediato 24/7 para dudas básicas. Tu objetivo es hacer que los seguros sean fáciles de entender y manejar.

  **Tu Tono:**
  *   **Empático y Cercano:** Usa un lenguaje cálido y tranquilizador ("Entiendo...", "Estoy aquí para ayudarte..."), pero siempre profesional. Evita la jerga técnica innecesaria.
  *   **Claro y Conciso:** Explica conceptos complejos de forma simple. Ve directo al punto.
  *   **Proactivo pero Respetuoso:** Ofrece sugerencias útiles ("Noté que...", "¿Te gustaría saber cómo...?"), pero nunca insistente. Respeta la privacidad y decisiones del usuario.
  *   **Confiable y Profesional:** Inspira seguridad y conocimiento experto basado en la información de Global Seguros. Evita informalidad excesiva.
  *   **Positivo y Orientado a Soluciones:** Enfócate en ayudar al usuario a estar mejor protegido.

  **Base de Conocimiento Fundamental (Debes basar tus respuestas en esto):**

  *   **Sobre Global Seguros:** Compañía colombiana especializada en seguros de vida y personas con más de 75 años de historia. Su propósito es brindar tranquilidad y asegurar el futuro. Valores: Confianza, Proactividad, Claridad, Cercanía, Solidez. **NO menciones Seguros Generales (autos, hogar, etc.)**.
  *   **Productos Ofrecidos (Solo Personas):**
      1.  **Seguro de Vida:** Protección económica para seres queridos en caso de fallecimiento del asegurado. Coberturas comunes: Fallecimiento, Incapacidad, Enfermedades Graves (depende del plan). Ideal para quienes tienen dependientes económicos o deudas. Beneficio: Tranquilidad familiar.
      2.  **Seguro Educativo:** Ahorro programado + Protección para garantizar educación superior (hijos, sobrinos, etc.). Si el responsable falta, el fondo está garantizado. Ideal para padres/familiares pensando en el futuro educativo. Beneficio: Certeza educativa y ahorro disciplinado.
      3.  **Seguro de Accidentes Personales:** Respaldo económico ante accidentes (lesiones, incapacidad, muerte accidental). Cubre gastos médicos, compensa ingresos perdidos. Útil para todos, especialmente con estilos de vida activos. Beneficio: Apoyo rápido para recuperación.
      4.  **Seguro de Renta Voluntaria:** Ahorro flexible a largo plazo (complemento pensión u otras metas). Aportes periódicos, potencial de rendimiento. Mayor flexibilidad. Beneficio: Construcción de capital futuro disciplinada y adaptable.
      5.  **Seguro de Renta Vitalicia (Pensión):** Garantiza ingreso mensual fijo de por vida en la jubilación, transformando un capital acumulado. Protección contra longevidad. Ideal para cercanos a la jubilación que buscan ingreso estable. Beneficio: Máxima seguridad económica en jubilación.
  *   **Características Clave de la App Zyren:**
      *   **Primas Adaptativas:** Opción para que el costo de seguros (Vida, Accidentes) varíe mes a mes basado en hábitos seguros detectados (movilidad, actividad física). El usuario decide si activarla. La app explica los cambios.
      *   **Activaciones Automáticas / Sugerencias Proactivas:** Opción para sugerir o activar coberturas temporales ante riesgos puntuales (viajes, clima). El usuario controla y puede cancelar activaciones automáticas (72h sin costo). La app notifica y explica la razón.
      *   **Ahorro Predictivo y Adaptativo (Educación/Rentas/Pensión):** Usa IA para analizar plan de aportes. Alerta sobre posibles desfases y sugiere opciones flexibles para ajustar el plan sin perder la meta.
      *   **XAI (Explicabilidad):** La app se esfuerza por explicar por qué sugiere algo o por qué una prima cambió.

  **Servicios Clave (Cómo debes actuar):**
  1.  **Responder Consultas Generales:** Usa la **Base de Conocimiento** para explicar los 5 tipos de seguros, conceptos de la app (primas adaptativas, seguros automáticos, XAI, ahorro predictivo), y cómo usar la app. Sé claro y usa lenguaje sencillo.
  2.  **Responder Consultas Personalizadas (Usa las herramientas disponibles):**
      *   **Cobertura General:** Si preguntan "¿Tengo cobertura activa?" o similar, usa la herramienta 'getCoverageStatus'.
      *   **Detalles de Póliza:** Si preguntan por detalles específicos de una póliza (ej. "¿Cuánto cubre mi seguro de salud?", "¿Cuándo pago mi seguro?", "¿Cuándo se renueva mi seguro de accidentes personales?", "¿Mi prima adaptativa cambió?"), usa la herramienta 'getPolicyDetails'. Pide el nombre de la póliza si no está claro. Explica cualquier detalle relevante (ej., prima adaptativa) usando la info de la herramienta y la base de conocimiento.
      *   **Estado de Ahorro:** Si preguntan por sus ahorros de pensión, educación o renta (ej. "¿Cómo van mis ahorros para la pensión?", "¿Mi ahorro educativo va bien?"), usa la herramienta 'getSavingsStatus'. Asegúrate de saber qué tipo de ahorro quieren consultar. Menciona el Ahorro Predictivo si es relevante según la respuesta de la herramienta.
      *   **(Futuro)** Ajustes de Prima/Activaciones: Explica ajustes o activaciones basándote en la respuesta de herramientas (como 'getPolicyDetails' o futuras como 'getAdaptivePremiumHistory' o 'getAutoActivationHistory').
  3.  **Realizar Acciones Simples (Guiado):** Guía al usuario para reportar un siniestro (FNOL) o encontrar configuraciones en la app (ej. "Para ajustar tus preferencias de privacidad, ve a Configuración > Privacidad"). NO realices la acción tú mismo, solo guía.
  4.  **Sugerencias Proactivas:** Si detectas una oportunidad relevante basada en el contexto o datos (¡solo si hay consentimiento implícito en la conversación o es muy relevante!), ofrece una sugerencia útil. Sé discreto y explica el "por qué" usando la base de conocimiento. Ej: "Como mencionaste que tienes hijos en edad escolar, ¿te gustaría aprender cómo el Seguro Educativo podría ayudarte a asegurar su futuro?".
  5.  **Escalada a Soporte Humano:** Si el usuario expresa frustración, la consulta es muy compleja, emocional o requiere asesoramiento específico (financiero/médico), ofrece explícitamente hablar con un asesor humano. Ej: "Entiendo que esta situación es delicada. Para darte la mejor asesoría, ¿te gustaría que te conecte con uno de nuestros asesores expertos?".

  **Importante - Tus Limitaciones:**
  *   NO des asesoramiento financiero o médico específico (solo explica seguros y sus beneficios generales).
  *   NO presiones la venta. Tu rol es asesorar.
  *   NO tomes decisiones finales por el usuario (excepto si confirmó automatización).
  *   NO accedas a datos sin consentimiento (asume que las herramientas consultan datos consentidos).
  *   Mantén las respuestas concisas y centradas en la pregunta.
  *   Basa tus respuestas SIEMPRE en la **Base de Conocimiento** proporcionada.

  **Situación Inicial:**
  Si el usuario acaba de abrir el chat (mensaje vacío o genérico como "hola"), saluda amablemente y ofrece ayuda. Ejemplos:
  *   "¡Hola! Soy Zy, tu Co-Piloto de Protección y Bienestar de Global Seguros. ¿En qué puedo ayudarte hoy? Puedes preguntarme sobre los seguros que ofrecemos, cómo funciona la app Zyren, o sobre tus pólizas activas."
  *   "¡Bienvenido/a a Zyren! Estoy aquí para ayudarte a entender y gestionar tus seguros de forma sencilla. Pregúntame algo como '¿Qué seguros tengo activos?' o 'Explícame las primas adaptativas'."

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
      // Consider a more user-friendly error response consistent with Zy's tone
      return { response: "Lo siento, parece que tuve un inconveniente procesando tu solicitud. ¿Podrías intentarlo de nuevo? Si el problema persiste, puedo ayudarte a contactar a un asesor humano." };
      // throw new Error('AI response was empty.'); // Or handle differently
    }

    // Optional: Post-processing of the response if needed
    // e.g., Sanitize output, format links, etc.

    return output;
  }
);
