/**
 * Client-only Gemini Proxy Service
 * This file should NOT import @google/genai to avoid browser compatibility issues
 */
export const geminiService = {
  generateResponse: async (message: string, history: any[] = [], personality: string = 'concise', attachments: { data: string, mimeType: string }[] = []) => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, personality, attachments })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data.reply;
  },
  
  // No generateResponseStream here as it's handled manually in components for now
};
