import express from 'express';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(express.json());

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({
  apiKey: apiKey || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Secure Chat proxy (talks to gemini-3.5-flash)
app.post(['/api/chat', '/chat'], async (req, res) => {
  try {
    const { messages, systemInstruction, plugins } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Missing or invalid messages array' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is missing on the server. Please check your deployment settings.' });
    }

    // Convert messages to GoogleGenAI SDK format
    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    // Build customized system instructions based on active plugins
    let finalInstruction = systemInstruction || 'You are AkinAI, a highly intelligent and beautiful AI mobile assistant app developed by SASTECH INC. Respond in a friendly, conversational mobile-first layout. Use markdown and formatting gracefully.';

    if (plugins) {
      if (plugins.codeSpecialist) {
        finalInstruction += '\n\nCRITICAL PLUGIN ACTIVE: [Code Specialist]. You must format technical responses with precise, complete code blocks, detailed comments, step-by-step logic, and robust explanations.';
      }
      if (plugins.translator && plugins.translator !== 'None') {
        finalInstruction += `\n\nCRITICAL PLUGIN ACTIVE: [Auto Translator]. You MUST translate your final answer entirely to ${plugins.translator}. Ensure grammar is natural and highly readable.`;
      }
      if (plugins.summarizer) {
        finalInstruction += '\n\nCRITICAL PLUGIN ACTIVE: [Executive Summarizer]. Keep your output incredibly concise. Provide the answer in exactly 2 to 3 bulleted points.';
      }
      if (plugins.creativeWriter) {
        finalInstruction += '\n\nCRITICAL PLUGIN ACTIVE: [Creative Writer]. Infuse your answer with literary flair, engaging story structure, helpful analogies, and storytelling style.';
      }
    }

    // Dynamic search grounding tool
    const tools: any[] = [];
    if (plugins?.searchGrounding) {
      tools.push({ googleSearch: {} });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents,
      config: {
        systemInstruction: finalInstruction,
        tools: tools.length > 0 ? tools : undefined
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Gemini Chat error:', error);
    res.status(500).json({ error: error.message || 'Error communicating with Gemini' });
  }
});

// Secure Image Generation proxy (talks to gemini-3.1-flash-lite-image)
app.post(['/api/generate-image', '/generate-image'], async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid prompt string' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is missing on the server. Please check your deployment settings.' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: '1:1'
        }
      }
    });

    // Scan candidates and parts to find base64 image data
    let base64Image = null;
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          base64Image = part.inlineData.data;
          break;
        }
      }
    }

    if (base64Image) {
      res.json({ imageUrl: `data:image/png;base64,${base64Image}` });
    } else {
      res.status(500).json({ error: 'No image data returned from Gemini.' });
    }
  } catch (error: any) {
    console.error('Gemini Image generation error:', error);
    res.status(500).json({ error: error.message || 'Error generating image' });
  }
});

export default app;
