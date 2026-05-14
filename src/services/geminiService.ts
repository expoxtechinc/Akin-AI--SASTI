import { GoogleGenAI } from "@google/genai";

/**
 * Frontend-only Gemini Service
 */
export const geminiService = {
  generateResponse: async (message: string, history: any[] = [], personality: string = 'concise') => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Gemini API Key missing");

    const ai = new GoogleGenAI({ apiKey });
    
    const sysPrompt = personality === 'creative' 
      ? "You are AkinAI, a creative and visionary assistant. Be warm, imaginative, and encouraging."
      : "You are AkinAI, a helpful and efficient assistant. Provide clear and accurate answers. Be warm and friendly.";

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history,
        { role: "user", parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: sysPrompt
      }
    });

    return response.text;
  },

  generateJson: async (prompt: string, schema?: any) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Gemini API Key missing");

    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    try {
      return JSON.parse(response.text || "{}");
    } catch (e) {
      console.error("Failed to parse JSON from AI:", response.text);
      throw new Error("Invalid response format from AI");
    }
  }
};
