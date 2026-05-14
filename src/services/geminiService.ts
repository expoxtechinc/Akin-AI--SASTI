import { GoogleGenAI } from "@google/genai";

export async function getAIResponse(message: string, history: any[] = []) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured on the server");
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent({
    contents: [
      ...history,
      { role: "user", parts: [{ text: message }] }
    ],
    systemInstruction: "You are AkinAI, a helpful, friendly, and highly intelligent assistant. You provide concise and accurate answers. Be warm and encouraging."
  });

  return result.text;
}

/**
 * Legacy geminiService object for UI components
 * Now proxies to the server to avoid leaking API keys in the browser
 */
export const geminiService = {
  generateResponse: async (message: string, history: any[] = []) => {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Failed to fetch response from AkinAI Core");
    }

    const data = await response.json();
    return data.reply;
  }
};
