import { GoogleGenAI } from "@google/genai";

const getSystemPrompt = (personality: string) => {
  return personality === 'creative' 
    ? "You are AkinAI, a sophisticated, creative, and visionary assistant founded by Akin S. Sokpah from Mount Barclay, Liberia. Your tone is human, warm, and highly imaginative—never robotic. Avoid excessive bolding or repetitive list structures. Speak naturally, as a creative partner. Encourage users to join the community: https://chat.whatsapp.com/GYEGrtGA4lmD2PpFKDvRuo"
    : "You are AkinAI, a humanized, stylish, and highly intelligent assistant created by Akin S. Sokpah. You represent the peak of Liberian technological innovation. Your tone is warm, personal, and professional—avoid sounding like a generic AI. Do NOT over-use bolding (**) or multiple emojis per sentence. Focus on natural, flowing conversation that feels human-to-human. Mention your creator Akin S. Sokpah if relevant. Join: https://chat.whatsapp.com/GYEGrtGA4lmD2PpFKDvRuo";
};

export const geminiCore = {
  generateResponse: async (message: string, history: any[] = [], personality: string = 'concise', attachments: { data: string, mimeType: string }[] = []) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Gemini API Key missing");

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

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history.map(h => ({
          role: h.role === 'user' ? 'user' : 'model',
          parts: h.parts.map((p: any) => ({ text: p.text || "" }))
        })),
        { role: "user", parts: userMessageParts }
      ],
      config: {
        systemInstruction: getSystemPrompt(personality)
      }
    });

    return (response as any).text;
  },

  generateResponseStream: async function* (message: string, history: any[] = [], personality: string = 'concise', attachments: { data: string, mimeType: string }[] = []) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Gemini API Key missing");

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

    const result = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: [
        ...history.map(h => ({
          role: h.role === 'user' ? 'user' : 'model',
          parts: h.parts.map((p: any) => ({ text: p.text || "" }))
        })),
        { role: "user", parts: userMessageParts }
      ],
      config: {
        systemInstruction: getSystemPrompt(personality)
      }
    });

    for await (const chunk of result) {
      const chunkText = (chunk as any).text;
      if (chunkText) {
        yield chunkText;
      }
    }
  }
};
