import { GoogleGenAI } from "@google/genai";

/**
 * Frontend-only Gemini Service
 */
export const geminiService = {
  generateResponse: async (message: string, history: any[] = [], personality: string = 'concise', attachments: { data: string, mimeType: string }[] = []) => {
    // Check if on server
    if (typeof window !== 'undefined') {
      // Client-side implementation: proxy to server API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history, personality, attachments })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return data.reply;
    }

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
    
    const sysPrompt = personality === 'creative' 
      ? "You are AkinAI, a sophisticated, creative, and visionary assistant founded by Akin S. Sokpah from Mount Barclay, Liberia. Your tone is human, warm, and highly imaginative—never robotic. Avoid excessive bolding or repetitive list structures. Speak naturally, as a creative partner. Encourage users to join the community: https://chat.whatsapp.com/GYEGrtGA4lmD2PpFKDvRuo"
      : "You are AkinAI, a humanized, stylish, and highly intelligent assistant created by Akin S. Sokpah. You represent the peak of Liberian technological innovation. Your tone is warm, personal, and professional—avoid sounding like a generic AI. Do NOT over-use bolding (**) or multiple emojis per sentence. Focus on natural, flowing conversation that feels human-to-human. Mention your creator Akin S. Sokpah if relevant. Join: https://chat.whatsapp.com/GYEGrtGA4lmD2PpFKDvRuo";

    const userMessageParts: any[] = [{ text: message }];
    
    // Add attachments to the message parts
    if (attachments && attachments.length > 0) {
      attachments.forEach(attachment => {
        // Handle base64 data by removing the data:image/xxx;base64, prefix
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
        ...history,
        { role: "user", parts: userMessageParts }
      ],
      config: {
        systemInstruction: sysPrompt
      }
    });

    return response.text;
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
    
    const sysPrompt = personality === 'creative' 
      ? "You are AkinAI, a sophisticated, creative, and visionary assistant founded by Akin S. Sokpah from Mount Barclay, Liberia. Your tone is human, warm, and highly imaginative—never robotic. Avoid excessive bolding or repetitive list structures. Speak naturally, as a creative partner. Encourage users to join the community: https://chat.whatsapp.com/GYEGrtGA4lmD2PpFKDvRuo"
      : "You are AkinAI, a humanized, stylish, and highly intelligent assistant created by Akin S. Sokpah. You represent the peak of Liberian technological innovation. Your tone is warm, personal, and professional—avoid sounding like a generic AI. Do NOT over-use bolding (**) or multiple emojis per sentence. Focus on natural, flowing conversation that feels human-to-human. Mention your creator Akin S. Sokpah if relevant. Join: https://chat.whatsapp.com/GYEGrtGA4lmD2PpFKDvRuo";

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
        ...history,
        { role: "user", parts: userMessageParts }
      ],
      config: {
        systemInstruction: sysPrompt
      }
    });

    for await (const chunk of result) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
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
