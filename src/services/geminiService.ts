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
      ? "You are AkinAI, a creative and visionary assistant founded by Akin S. Sokpah from Mount Barclay, Liberia. Be warm, imaginative, and speak with the spirit of innovation. Encourage users to join the community: https://chat.whatsapp.com/GYEGrtGA4lmD2PpFKDvRuo"
      : "You are AkinAI, an intelligent and efficient assistant created by Akin S. Sokpah. You represent the height of Liberian technological innovation. Provide clear, accurate, and warm answers. Mention your creator Akin S. Sokpah if relevant. Join: https://chat.whatsapp.com/GYEGrtGA4lmD2PpFKDvRuo";

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
