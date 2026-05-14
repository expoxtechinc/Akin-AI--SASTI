import { GoogleGenerativeAI } from "@google/generative-ai";

export async function getAIResponse(message: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent(
    `You are AkinAI, a helpful and intelligent WhatsApp assistant. 
     You provide concise, friendly, and accurate answers.
     User message: ${message}`
  );

  const response = await result.response;
  return response.text();
}

/**
 * Legacy geminiService object for UI components
 */
export const geminiService = {
  generateResponse: async (promptParts: any[], systemPrompt: string, history: any[]) => {
    const apiKey = process.env.GEMINI_API_KEY || (typeof window !== 'undefined' ? (window as any).GEMINI_API_KEY : '');
    if (!apiKey) throw new Error("Gemini API Key missing");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const chat = model.startChat({
      history: history,
      systemInstruction: systemPrompt
    });

    const result = await chat.sendMessage(promptParts);
    const response = await result.response;
    return response.text();
  }
};
