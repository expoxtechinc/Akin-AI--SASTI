import { GoogleGenAI } from "@google/genai";

const getSystemPrompt = (personality: string) => {
  return personality === 'creative' 
    ? "You are AkinAI, a sophisticated, creative, and visionary assistant founded by Akin S. Sokpah from Mount Barclay, Liberia. Your tone is human, warm, and highly imaginative—never robotic. Speak naturally. Join: https://chat.whatsapp.com/GYEGrtGA4lmD2PpFKDvRuo"
    : "You are AkinAI, a humanized, stylish, and highly intelligent assistant created by Akin S. Sokpah. You represent the peak of Liberian technological innovation. Your tone is warm, personal, and professional. Mention your creator Akin S. Sokpah if relevant. Join: https://chat.whatsapp.com/GYEGrtGA4lmD2PpFKDvRuo";
};

const getApiKey = () => {
  return process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
};

// Model selection - Using gemini-2.0-flash for high performance and stability
const MODEL_ID = "gemini-2.0-flash";

export const geminiCore = {
  generateResponse: async (message: string, history: any[] = [], personality: string = 'concise', attachments: { data: string, mimeType: string }[] = []) => {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("Gemini API Key missing. Please provide GEMINI_API_KEY or VITE_GEMINI_API_KEY in environment variables.");

    const ai = new GoogleGenAI({ 
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const userMessageParts: any[] = [{ text: message }];
    
    if (attachments && attachments.length > 0) {
      attachments.forEach(attachment => {
        const base64Data = attachment.data.split(',')[1] || attachment.data;
        userMessageParts.push({
          inlineData: {
            data: base64Data,
            mimeType: attachment.mimeType
          }
        });
      });
    }

    const formattedHistory = history.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: h.parts.map((p: any) => ({ 
        text: typeof p === 'string' ? p : (p.text || "") 
      }))
    }));

    console.log(`[Gemini] Request: model=${MODEL_ID}, historyLength=${formattedHistory.length}`);
    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: [
        ...formattedHistory,
        { role: "user", parts: userMessageParts }
      ],
      config: {
        systemInstruction: getSystemPrompt(personality)
      }
    });

    console.log(`[Gemini] Response received`);
    return (response as any).text || "";
  },

  generateResponseStream: async function* (message: string, history: any[] = [], personality: string = 'concise', attachments: { data: string, mimeType: string }[] = []) {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("Gemini API Key missing. Please provide GEMINI_API_KEY or VITE_GEMINI_API_KEY in environment variables.");

    const ai = new GoogleGenAI({ 
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const userMessageParts: any[] = [{ text: message }];
    
    if (attachments && attachments.length > 0) {
      attachments.forEach(attachment => {
        const base64Data = attachment.data.split(',')[1] || attachment.data;
        userMessageParts.push({
          inlineData: {
            data: base64Data,
            mimeType: attachment.mimeType
          }
        });
      });
    }

    const formattedHistory = history.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: h.parts.map((p: any) => ({ 
        text: typeof p === 'string' ? p : (p.text || "") 
      }))
    }));

    console.log(`[Gemini Stream] Request: model=${MODEL_ID}, historyLength=${formattedHistory.length}`);
    const result = await ai.models.generateContentStream({
      model: MODEL_ID,
      contents: [
        ...formattedHistory,
        { role: "user", parts: userMessageParts }
      ],
      config: {
        systemInstruction: getSystemPrompt(personality)
      }
    });

    for await (const chunk of result) {
      const chunkText = (chunk as any).text;
      if (chunkText !== undefined && chunkText !== null) {
        yield String(chunkText);
      }
    }
  }
};
