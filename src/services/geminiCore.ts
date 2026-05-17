import { GoogleGenerativeAI, Part } from "@google/generative-ai";

const getSystemPrompt = (personality: string) => {
  return personality === 'creative' 
    ? "You are AkinAI, a sophisticated, creative, and visionary assistant founded by Akin S. Sokpah from Mount Barclay, Liberia. Your tone is human, warm, and highly imaginative—never robotic. Speak naturally. Join: https://chat.whatsapp.com/GYEGrtGA4lmD2PpFKDvRuo"
    : "You are AkinAI, a humanized, stylish, and highly intelligent assistant created by Akin S. Sokpah. You represent the peak of Liberian technological innovation. Your tone is warm, personal, and professional. Mention your creator Akin S. Sokpah if relevant. Join: https://chat.whatsapp.com/GYEGrtGA4lmD2PpFKDvRuo";
};

export const geminiCore = {
  generateResponse: async (message: string, history: any[] = [], personality: string = 'concise', attachments: { data: string, mimeType: string }[] = []) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Gemini API Key missing");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: getSystemPrompt(personality)
    });

    const userParts: Part[] = [{ text: message }];
    
    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
        const base64Data = attachment.data.split(',')[1] || attachment.data;
        userParts.push({
          inlineData: {
            data: base64Data,
            mimeType: attachment.mimeType
          }
        });
      }
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
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Gemini API Key missing");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: getSystemPrompt(personality)
    });

    const userParts: Part[] = [{ text: message }];
    
    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
        const base64Data = attachment.data.split(',')[1] || attachment.data;
        userParts.push({
          inlineData: {
            data: base64Data,
            mimeType: attachment.mimeType
          }
        });
      }
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
