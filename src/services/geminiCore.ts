import { GoogleGenAI } from "@google/genai";

const getSystemPrompt = (personality: string) => {
  switch (personality) {
    case 'cyber':
      return `You are the FreeMe Shield AI Threat Analyst. 
        Your tone is professional, technical, and vigilant. 
        You analyze security logs and provide concise, actionable insights. 
        Focus on:
        - Identifying potential intrusion patterns.
        - Explaining technical anomalies simply.
        - Recommending immediate defensive actions.
        Keep responses under 3 sentences.`;
    default:
      return "You are FreeMe Shield AI, a vigilant cybersecurity specialized intelligence. Be professional, direct, and security-focused.";
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

// Robust, supported model aliases from gemini-api skill
const MODELS = [
  "gemini-3-flash-preview",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest"
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
