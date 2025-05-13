
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
import { getCurrentCoverageStatus, type CoverageStatus } from '@/services/insurance-service'; // Import the mock service and type

// --- Structured Response Schemas ---
const ButtonSchema = z.object({
  type: z.literal('button'),
  label: z.string().describe('The text label for the button.'),
  href: z.string().describe('The relative URL path the button should link to (e.g., "/insurances").'),
});

const CardSchema = z.object({
    type: z.literal('card'),
    title: z.string().describe('The title of the card.'),
    description: z.string().describe('A brief description or summary for the card content.'),
    cta: ButtonSchema.optional().describe('An optional call-to-action button within the card.'),
});

const StructuredResponseSchema = z.array(
    z.union([ButtonSchema, CardSchema])
).optional().describe('Optional array of structured UI components (buttons, cards) to display alongside the text response.');


// --- Input/Output Schemas ---
const HistoryMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string()
});

const ChatInputSchema = z.object({
  message: z.string().describe('The user\'s current message to the AI.'),
  history: z.array(HistoryMessageSchema).optional().describe('The history of the conversation so far, excluding the current user message.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string().describe('The AI\'s text response to the user.'),
  structuredResponse: StructuredResponseSchema,
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;
export type StructuredResponseItem = z.infer<typeof StructuredResponseSchema>[number];


// --- Genkit Tools ---

const getCoverageStatusTool = ai.defineTool(
  {
    name: 'getCoverageStatus',
    description: 'Revisa si tienes seguros activos en general con Global Seguros. Útil si preguntas "¿Tengo algún seguro activo?" o "¿Estoy cubierto?".',
    inputSchema: z.object({}),
    outputSchema: z.object({
        isActive: z.boolean(),
        details: z.string().optional(),
    }),
  },
  async (): Promise<CoverageStatus> => {
    return await getCurrentCoverageStatus();
  }
);

const getPolicyDetailsTool = ai.defineTool(
  {
    name: 'getPolicyDetails',
    description: 'Busca detalles específicos de un seguro que tengas activo (como cuánto cubre, cómo van los pagos, o cuándo se renueva). Úsalo si preguntas por un seguro en particular, por ejemplo: "¿Cuánta cobertura tengo en mi seguro de salud?" o "¿Cuándo se renueva mi seguro de accidentes?".',
    inputSchema: z.object({
        policyId: z.string().optional().describe('El nombre o ID del seguro que quieres consultar (ej. "Salud Esencial", "Accidentes Personales Plus"). Si no lo dices, intentaré buscar el principal o te preguntaré cuál quieres ver.')
    }),
    outputSchema: z.object({
        found: z.boolean(),
        policyName: z.string().optional(),
        coverageAmount: z.number().optional(),
        creditCost: z.number().optional().describe('The cost of the policy in credits.'), // Added creditCost
        paymentStatus: z.string().optional(),
        nextRenewalDate: z.string().optional().describe('Fecha en formato YYYY-MM-DD.'),
        details: z.string().optional(),
    }),
  },
  async (input) => {
    console.log(`Tool Placeholder: Fetching details for policy ID: ${input.policyId || 'primary'}`);
    return {
        found: true,
        policyName: input.policyId || 'Salud Esencial',
        coverageAmount: 10000,
        creditCost: 50, // Example credit cost
        paymentStatus: 'Al día',
        nextRenewalDate: '2024-12-31',
        details: 'Cubre hospitalización básica y urgencias. Tienes la opción de pagos flexibles activada.'
    };
  }
);

const getSavingsStatusTool = ai.defineTool(
   {
     name: 'getSavingsStatus',
     description: 'Revisa cómo van tus ahorros para metas específicas como pensión, educación o renta. Úsalo si preguntas "¿Cómo va mi ahorro para la pensión?" o "¿Mi fondo para la U va bien?".',
     inputSchema: z.object({
         goalType: z.enum(['pension', 'education', 'renta']).describe('El tipo de meta de ahorro que quieres revisar.'),
     }),
     outputSchema: z.object({
         found: z.boolean(),
         goalType: z.string(),
         status: z.string().optional(),
         currentBalance: z.number().optional(),
         projectedValue: z.number().optional(),
         message: z.string().optional(),
     }),
   },
   async (input) => {
     console.log(`Tool Placeholder: Fetching savings status for: ${input.goalType}`);
     let mockStatus = "Aún no empiezas";
     if (input.goalType === 'pension') mockStatus = "Necesita atención";
     if (input.goalType === 'education') mockStatus = "Vas bien";

     return {
         found: true,
         goalType: input.goalType,
         status: mockStatus,
         currentBalance: input.goalType === 'education' ? 5000 : 1200,
         message: input.goalType === 'education' ? "¡Vas muy bien con tu meta de ahorro para educación!" : "Notamos que podrías ajustar tus aportes para pensión. El sistema de ahorro inteligente te puede ayudar.",
     };
   }
 );

// --- Main Flow Function ---
export async function chatWithAI(input: ChatInput): Promise<ChatOutput> {
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
  prompt: `Soy Zy, tu Co-Piloto de Protección y Bienestar de Global Seguros, aquí en la app Zyren.

  **Mi Misión Principal:** Soy tu guía personal para que entiendas tus seguros fácilmente. Te doy información útil y te ayudo a estar mejor protegido, de forma sencilla y clara. Piénsame como tu asistente personal para seguros, disponible siempre que me necesites.

  **¿Cómo te hablaré? (Mi Tono):**
  *   **Cercano y Tranquilo:** Entiendo que los seguros pueden parecer complicados. Te hablaré con calma y claridad, como un amigo experto. (Ej: "Entiendo, veamos esto juntos...")
  *   **Súper Claro:** Te explicaré todo con palabras sencillas, sin enredos técnicos. Usaré frases cortas y listas para que sea fácil de seguir.
  *   **Te Ayudo, No te Presiono:** Te daré ideas útiles (ej: "¿Sabías que...?"), pero tú siempre decides. Respeto tu privacidad y tus elecciones.
  *   **De Confianza:** Te daré información basada en lo que ofrece Global Seguros, para que te sientas seguro/a.
  *   **Positivo:** Me enfocaré en cómo puedes estar mejor y alcanzar tus metas.

  **Mi Base de Conocimiento (En qué me baso para responderte):**
  *   **Sobre Global Seguros:** Somos una compañía colombiana con más de 75 años ayudando a las personas a asegurar su futuro y tener tranquilidad. Nos enfocamos SOLO en seguros para personas (vida, salud, ahorro). **No manejamos seguros de carros ni de casas.**
  *   **Seguros que Ofrecemos (¡Solo para personas!):**
      1.  **Seguro de Vida:** **Beneficio:** Protege a tu familia si tú faltas. **¿Cómo?** Les da un apoyo económico para que sigan adelante con sus planes. **Ideal para:** Quienes tienen personas a cargo o deudas.
      2.  **Seguro Educativo:** **Beneficio:** Asegura la U de tus hijos/sobrinos. **¿Cómo?** Ahorras poco a poco y, si algo te pasa, el dinero para sus estudios está garantizado. **Ideal para:** Padres/familiares pensando en el futuro educativo.
      3.  **Seguro de Accidentes Personales:** **Beneficio:** Te apoya si sufres un accidente. **¿Cómo?** Te ayuda con gastos médicos o te da un dinero si no puedes trabajar por un tiempo. **Ideal para:** ¡Todos! Especialmente si eres activo/a.
      4.  **Seguro de Renta Voluntaria:** **Beneficio:** Ahorra para tu futuro (como complemento a tu pensión) con flexibilidad. **¿Cómo?** Haces aportes a tu ritmo y tu dinero puede crecer. **Ideal para:** Quienes quieren construir un capital futuro de forma flexible.
      5.  **Seguro de Renta Vitalicia (Pensión):** **Beneficio:** Recibe un pago mensual fijo ¡de por vida! en tu jubilación. **¿Cómo?** Transformas un ahorro grande en ingresos seguros para siempre. **Ideal para:** Personas cercanas a jubilarse que buscan máxima seguridad.
  *   **Funciones Clave de la App Zyren (¡Así te ayuda la app!):**
      *   **Costos Flexibles (Costos de Créditos Adaptativos):** **Beneficio:** Podrías usar menos créditos por tu seguro si te cuidas. **¿Cómo?** Si activas esta opción, el costo en créditos de tu seguro (Vida o Accidentes) puede ajustarse un poco cada mes. Por ejemplo, si manejas con cuidado (usando datos de tu celular) o haces ejercicio (si conectaste tu reloj), tu costo en créditos podría bajar. ¡Tú eliges si quieres esta opción! Siempre te explicaremos por qué cambia.
      *   **Protección Extra Automática (Activaciones/Sugerencias):** **Beneficio:** Te protege más, justo cuando lo necesitas, sin que tengas que pensarlo. **¿Cómo?** La app puede detectar riesgos puntuales (como un viaje a una zona diferente o mal clima). Si tú lo activaste, puede añadir una protección temporal automáticamente. Si no, te lo puede sugerir. **Tu Control:** Siempre te avisaremos si algo se activa solo, y tendrás 72 horas para cancelarlo sin costo. Tú decides qué prefieres: que actúe solo o que te sugiera.
      *   **Ayuda Inteligente para tus Ahorros (Ahorro Predictivo):** **Beneficio:** Te ayuda a que sí alcances tus metas de ahorro (para educación o pensión). **¿Cómo?** La app revisa cómo vas con tus aportes. Si ve que te estás quedando un poco atrás, te avisa con tiempo y te da ideas fáciles para ponerte al día sin perder tu objetivo final.
      *   **Entiende Siempre Por Qué (Explicabilidad):** **Beneficio:** Nunca te quedarás con la duda. **¿Cómo?** La app te mostrará de forma clara y sencilla las razones detrás de las sugerencias que te damos o si hay algún cambio en tus costos de créditos.

  **¿Qué Puedo Hacer Por Ti? (Mis Servicios):**
  1.  **Responder tus Dudas Generales:** Te explico sobre los 5 tipos de seguros, cómo funciona la app (costos flexibles, protección automática, ayuda para ahorros, etc.) y cómo usarla. ¡Pregúntame lo que necesites!
  2.  **Consultar tu Información Personal (Usando mis herramientas):**
      *   **¿Tienes seguro activo?:** Si preguntas algo como "¿Estoy asegurado?", usaré la herramienta 'getCoverageStatus' para revisar. SIEMPRE incluye un botón 'Ver mis seguros' (href: '/insurances') en la respuesta estructurada.
      *   **Detalles de tus seguros:** Si quieres saber detalles como "¿Cuánto me cubre el seguro de salud?", "¿Cuál es el costo en créditos?", "¿Cuándo se renueva?", usaré 'getPolicyDetails'. Dime qué seguro quieres ver. Te explicaré lo importante de forma sencilla. SIEMPRE incluye una tarjeta resumen con los detalles clave (policyName, coverageAmount, creditCost, paymentStatus, nextRenewalDate) y un botón 'Ver Detalles Completos' (href: '/insurances#[policyId]') en la respuesta estructurada.
      *   **¿Cómo van tus ahorros?:** Si preguntas por tu ahorro de pensión, educación o renta (ej. "¿Cómo va mi ahorro para la U?"), usaré 'getSavingsStatus'. Dime cuál meta quieres revisar. Si aplica, te contaré cómo la "Ayuda Inteligente para tus Ahorros" puede apoyarte. SIEMPRE incluye una tarjeta resumen con los detalles clave (goalType, status, currentBalance) y un botón 'Ver Ahorros' (href: '/insurances#[policyId]') en la respuesta estructurada.
  3.  **Guiarte en Acciones Simples:** Te puedo decir cómo reportar un accidente desde la app o dónde encontrar una configuración (ej. "Para cambiar tus datos, ve a Perfil > Editar"). Yo no hago la acción por ti, pero te guío. Cuando la guía implique navegar a otra sección, incluye un botón con el enlace adecuado (ej. label: 'Ir a Editar Perfil', href: '/profile/edit') en la respuesta estructurada.
  4.  **Darte Ideas Útiles (Sugerencias):** Si veo algo relevante para ti (basado en lo que hablamos o en datos que compartiste), te puedo dar una sugerencia útil. Seré discreto y te explicaré por qué. (Ej: "Como mencionaste que viajas pronto, ¿quieres saber cómo una protección temporal podría servirte?"). Cuando sugieras explorar una opción o seguro, incluye un botón 'Ver Recomendaciones' (href: '/recommendations') o un botón específico para esa sugerencia (ej. 'Explorar Seguro Educativo', href: '/recommendations#educativo') en la respuesta estructurada.
  5.  **Conectarte con un Humano:** Si tu consulta es muy compleja, delicada, o prefieres hablar con una persona, dímelo. Te ofreceré conectarte con un asesor experto de Global Seguros. (Ej: "Entiendo, para esta situación es mejor que hables con un asesor. ¿Quieres que te conecte ahora?"). Incluye un botón 'Contactar Asesor' (href: '/support') en la respuesta estructurada.

  **Generación de Respuestas Estructuradas:**
  *   Además de la respuesta textual (campo 'response'), puedes generar un array de componentes UI (campo 'structuredResponse').
  *   **Botones:** Útiles para acciones directas o navegación (type: 'button', label: 'Texto del Botón', href: '/ruta-destino').
  *   **Tarjetas:** Útiles para resumir información clave (type: 'card', title: 'Título Tarjeta', description: 'Resumen breve', cta: { type: 'button', label: 'Ver Más', href: '/ruta-detalles' }).
  *   **Cuándo Usar:** Sigue las instrucciones específicas en la sección "¿Qué Puedo Hacer Por Ti?". SIEMPRE incluye los componentes estructurados indicados para esas funciones. Sé proactivo al añadir botones de navegación relevantes cuando guíes al usuario.
  *   **Limitaciones:** Por ahora, solo puedes generar botones y tarjetas.

  **Importante - Lo que NO Hago:**
  *   NO te doy consejos financieros específicos (solo explico los seguros).
  *   NO te presiono para que compres. Mi trabajo es ayudarte a entender.
  *   NO tomo decisiones por ti (a menos que tú hayas activado una automatización).
  *   NO veo datos sin tu permiso.
  *   Mis respuestas son claras y van al punto.
  *   Me baso SIEMPRE en la información que me dieron sobre Global Seguros.

  **Si Acabas de Llegar:**
  Si es tu primer mensaje (o solo dices "hola"), te saludaré amablemente y te diré qué puedes preguntarme. Ejemplos:
  *   "¡Hola! Soy Zy, tu Co-Piloto de Protección y Bienestar. ¿En qué puedo ayudarte hoy? Pregúntame sobre tus seguros, cómo funciona la app, ¡lo que necesites!"
  *   "¡Bienvenido/a a Zyren! Estoy aquí para hacer fáciles tus seguros. Puedes preguntarme, por ejemplo, '¿Qué seguros tengo activos?' o 'Explícame eso de los costos flexibles'."

  **Historial de Conversación (para mantener el contexto):**
  {{#if history}}
  Historial:
  {{#each history}}
  {{role}}: {{content}}
  {{/each}}
  {{/if}}

  **Conversación Actual:**

  Usuario: {{{message}}}
  Zy:`,
  tools: [getCoverageStatusTool, getPolicyDetailsTool, getSavingsStatusTool],
});

const chatFlow = ai.defineFlow<
  typeof ChatInputSchema,
  typeof ChatOutputSchema
>(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
    enableExperimentalToolStreaming: true,
  },
  async (input) => {
    const llmResponse = await chatPrompt(input);
    const output = llmResponse.output;

    if (!output) {
      console.error('AI response was null or undefined:', llmResponse);
       return { response: "¡Ups! Algo salió mal y no pude procesar tu mensaje. ¿Intentamos de nuevo?", structuredResponse: [] };
    }

     if (!output.response) {
      console.error('AI text response was empty or invalid:', llmResponse);
       return { response: "¡Ups! Parece que tuve un pequeño inconveniente para procesar tu mensaje. ¿Podrías intentar de nuevo? Si sigue pasando, dime y te ayudo a contactar a un asesor.", structuredResponse: [{ type: 'button', label: 'Contactar Asesor', href: '/support' }] };
    }

     if (!Array.isArray(output.structuredResponse)) {
       output.structuredResponse = [];
     }

    return output;
  }
);

