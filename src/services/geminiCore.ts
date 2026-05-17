import { GoogleGenerativeAI } from "@google/generative-ai";

const getSystemPrompt = (personality: string) => {
  return personality === 'creative' 
    ? "You are AkinAI, a sophisticated, creative, and visionary assistant founded by Akin S. Sokpah from Mount Barclay, Liberia. Your tone is human, warm, and highly imaginative—never robotic. Speak naturally. Join: https://chat.whatsapp.com/GYEGrtGA4lmD2PpFKDvRuo"
    : "You are AkinAI, a humanized, stylish, and highly intelligent assistant created by Akin S. Sokpah. You represent the peak of Liberian technological innovation. Your tone is warm, personal, and professional. Mention your creator Akin S. Sokpah if relevant. Join: https://chat.whatsapp.com/GYEGrtGA4lmD2PpFKDvRuo";
};

const getApiKey = () => {
  return process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
};

// Model selection - Gemini 1.5 Flash is the most stable for general chat
const MODEL_ID = "gemini-1.5-flash";

export const geminiCore = {
  generateResponse: async (message: string, history: any[] = [], personality: string = 'concise', attachments: { data: string, mimeType: string }[] = []) => {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("Gemini API Key missing. Please provide GEMINI_API_KEY or VITE_GEMINI_API_KEY in environment variables.");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: MODEL_ID,
      systemInstruction: getSystemPrompt(personality)
    });

    const userParts: any[] = [{ text: message }];
    
    if (attachments && attachments.length > 0) {
      attachments.forEach(attachment => {
        const base64Data = attachment.data.split(',')[1] || attachment.data;
        userParts.push({
          inlineData: {
            data: base64Data,
            mimeType: attachment.mimeType
          }
        });
      });
    }

    const chat = model.startChat({
      history: history.map(h => ({
        role: h.role,
        parts: h.parts.map((p: any) => ({ text: typeof p === 'string' ? p : (p.text || "") }))
      }))
    });

    const result = await chat.sendMessage(userParts);
    const response = await result.response;
    return response.text();
  },

  generateResponseStream: async function* (message: string, history: any[] = [], personality: string = 'concise', attachments: { data: string, mimeType: string }[] = []) {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("Gemini API Key missing. Please provide GEMINI_API_KEY or VITE_GEMINI_API_KEY in environment variables.");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: MODEL_ID,
      systemInstruction: getSystemPrompt(personality)
    });

    const userParts: any[] = [{ text: message }];
    
    if (attachments && attachments.length > 0) {
      attachments.forEach(attachment => {
        const base64Data = attachment.data.split(',')[1] || attachment.data;
        userParts.push({
          inlineData: {
            data: base64Data,
            mimeType: attachment.mimeType
          }
        });
      });
    }

    const chat = model.startChat({
      history: history.map(h => ({
        role: h.role,
        parts: h.parts.map((p: any) => ({ text: typeof p === 'string' ? p : (p.text || "") }))
      }))
    });

    const result = await chat.sendMessageStream(userParts);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        yield chunkText;
      }
    }
  }
};
