
import { GoogleGenAI } from "@google/genai";
import { GlobalState } from "../types";

export async function askABCAssistant(query: string, state: Partial<GlobalState>) {
  // Always use a named parameter for the API key from process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    You are a theoretical physicist specialized in 'ABC Theory of Emergent Quantum Gravity'.
    In this theory:
    - a, b, c are fundamental values in Planck units.
    - Mass is calculated as |n_a*a - n_b*b - n_c*c| * alpha.
    - Gravity is not a force but a property emerging from the curvature of a discrete ABC lattice.
    - Tics are discrete time units.
    
    Current simulation context:
    - Parameters: a=${state.a}, b=${state.b}, c=${state.c}
    - Coupling: alpha=${state.alpha}, alpha_s=${state.alpha_s}
    - Nodes: ${state.nodes?.length}
    - Curvature: ${state.triangles?.reduce((acc, t) => acc + Math.abs(t.curvature), 0) || 0}
    
    Provide insightful, technically grounded responses. Suggest parameter optimizations to match known physical constants like electron mass (0.511 MeV) or G (6.674e-11).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    // Access the .text property directly as per Gemini API guidelines
    return response.text || "Lo siento, no pude procesar tu consulta.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error al conectar con el asistente de IA.";
  }
}
