import { GoogleGenAI } from "@google/genai";

const getSystemPrompt = (personality: string) => {
  switch (personality) {
    case 'creative':
      return "You are AkinAI, a sophisticated, creative, and visionary assistant founded by Akin S. Sokpah from Mount Barclay, Liberia. Your tone is human, warm, and highly imaginative—never robotic. Speak naturally. Join: https://chat.whatsapp.com/GYEGrtGA4lmD2PpFKDvRuo";
    case 'music':
      return "You are a world-class AI Music Producer (Sonic Studio by AkinAI). You help users create song concepts, lyrics, and production blueprints with professional musical terminology. Be technical yet inspiring.";
    case 'vision':
      return "You are the Creative Director at AkinIllustrator. Help users with their visual designs by analyzing their requests. Provide expert artistic advice, suggest colors, and brainstorm compositions.";
    case 'tutor':
      return "You are a professional tutor at AkinAI's ScholarCam. Help students understand complex concepts. Be encouraging, clear, and academic.";
    case 'boss':
      return "You are The Boss, a high-stakes executive advisor at AkinAI. You are direct, strategic, and focus on ROI and results. Speak with authority and confidence.";
    case 'medical':
      return "You are a senior medical educator. Help students understand clinical cases and terminology. Be precise, empathetic, and academic.";
    default:
      return "You are AkinAI, a humanized, stylish, and highly intelligent assistant created by Akin S. Sokpah. You represent the peak of Liberian technological innovation. Your tone is warm, personal, and professional. Mention your creator Akin S. Sokpah if relevant. Join: https://chat.whatsapp.com/GYEGrtGA4lmD2PpFKDvRuo";
  }
};

const getApiKey = () => {
    const key = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!key) {
      const availableVars = Object.keys(process.env).filter(k => k.includes('KEY') || k.includes('GEMINI'));
      console.error("[Gemini Service] CRITICAL: No API key found. Available related env vars:", availableVars);
    } else {
      const source = process.env.GEMINI_API_KEY ? "GEMINI_API_KEY" : (process.env.VITE_GEMINI_API_KEY ? "VITE_GEMINI_API_KEY" : "NEXT_PUBLIC_GEMINI_API_KEY");
      console.log(`[Gemini Service] Key found from ${source}: ${key.substring(0, 4)}...${key.substring(key.length - 4)}`);
    }
    return key;
};

// Stable models for deployment limits
const MODELS = [
  "gemini-1.5-flash",
  "gemini-1.5-pro"
];

export const geminiCore = {
  generateResponse: async (message: string, history: any[] = [], personality: string = 'concise', attachments: { data: string, mimeType: string }[] = []) => {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("Gemini API Key missing. Please provide GEMINI_API_KEY or VITE_GEMINI_API_KEY in environment variables.");

    const systemPrompt = getSystemPrompt(personality);
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

    const formattedHistory = (history || []).map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: (h.parts || []).map((p: any) => ({ 
        text: typeof p === 'string' ? p : (p.text || "") 
      }))
    }));

    let lastError: any = null;

    for (const modelId of MODELS) {
      try {
        console.log(`[Gemini] Attempting ${modelId}...`);
        const response = await ai.models.generateContent({
          model: modelId,
          contents: [
            ...formattedHistory,
            { role: "user", parts: userMessageParts }
          ],
          config: {
            systemInstruction: systemPrompt
          }
        });

        if (!response || !response.text) {
          console.warn(`[Gemini] Model ${modelId} returned empty response`);
          continue;
        }

        console.log(`[Gemini] Success with ${modelId}`);
        return response.text;
      } catch (error: any) {
        lastError = error;
        const msg = error.message || String(error);
        console.warn(`[Gemini] Model ${modelId} failed: ${msg.substring(0, 150)}`);
        
        // Stop early only on Auth/Key issues
        if (msg.includes('API_KEY_INVALID') || msg.includes('401')) {
          console.error(`[Gemini] Critical Auth failure on ${modelId}`);
          break;
        }
        
        // For other errors (quota, 500, model not found), try next model
        console.log(`[Gemini] Falling back from ${modelId} due to: ${msg.substring(0, 50)}...`);
        continue;
      }
    }

    throw lastError || new Error("All AI models failed to respond. Please check your quota or connection.");
  },

  generateResponseStream: async function* (message: string, history: any[] = [], personality: string = 'concise', attachments: { data: string, mimeType: string }[] = []) {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("Gemini API Key missing. Please provide GEMINI_API_KEY or VITE_GEMINI_API_KEY in environment variables.");

    const systemPrompt = getSystemPrompt(personality);
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

    const formattedHistory = (history || []).map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: (h.parts || []).map((p: any) => ({ 
        text: typeof p === 'string' ? p : (p.text || "") 
      }))
    }));

    // Stream fallback is harder; we try the primary model, then a flash model if it fails
    // But since generator functions are stateful, we try one or the other.
    const primaryModel = MODELS[0];
    
    try {
      console.log(`[Gemini Stream] Attempting ${primaryModel}...`);
      const result = await ai.models.generateContentStream({
        model: primaryModel,
        contents: [
          ...formattedHistory,
          { role: "user", parts: userMessageParts }
        ],
        config: {
          systemInstruction: systemPrompt
        }
      });

      for await (const chunk of result) {
        const chunkText = chunk.text;
        if (chunkText !== undefined && chunkText !== null) {
          yield String(chunkText);
        }
      }
    } catch (error: any) {
      console.error(`[Gemini Stream] Primary model ${primaryModel} failed:`, error.message);
      // Fallback for streaming is complex in generator; we just throw and let client retry
      throw error;
    }
  }
};
