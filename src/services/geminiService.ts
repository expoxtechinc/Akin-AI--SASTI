/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not defined in the environment.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export const geminiService = {
  async generateResponse(
    prompt: string | { text: string, inlineData?: { data: string, mimeType: string } }[], 
    contextPrompt: string, 
    history: { role: 'user' | 'model', parts: { text: string }[] }[] = []
  ) {
    if (!apiKey) {
      throw new Error("API Key missing. Please check your environment configuration.");
    }

    try {
      const model = "gemini-3-flash-preview";

      // Flatten history and current prompt into contents
      const contents = [
        ...history,
        {
          role: 'user',
          parts: Array.isArray(prompt) ? prompt : [{ text: prompt }]
        }
      ];
      
      const response = await ai.models.generateContent({
        model,
        config: {
          systemInstruction: contextPrompt,
        },
        contents: contents as any,
      });

      return response.text;
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      if (error.message?.includes('403') || error.message?.includes('400')) {
        throw new Error("API Key Invalid or Permission Denied. Please check your API key in Settings > Secrets.");
      }
      throw error;
    }
  },

  async generateResponseStream(prompt: string, contextPrompt: string, history: any[] = []) {
    if (!apiKey) {
      throw new Error("API Key missing.");
    }

    const model = "gemini-3-flash-preview";
    const chat = ai.chats.create({
      model,
      config: {
        systemInstruction: contextPrompt,
      },
      history,
    });

    return await chat.sendMessageStream({ message: prompt });
  }
};
