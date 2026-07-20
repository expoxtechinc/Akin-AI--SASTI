// server.ts
import express from "express";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();
var __filename = "";
var __dirname = "";
try {
  __filename = fileURLToPath(import.meta.url);
  __dirname = path.dirname(__filename);
} catch (e) {
  __dirname = process.cwd();
}
var app = express();
app.use(express.json());
var apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("WARNING: GEMINI_API_KEY environment variable is not set. Please set GEMINI_API_KEY to enable AkinAI chat responses.");
}
var ai = new GoogleGenAI({
  apiKey: apiKey || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, systemInstruction, plugins } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Missing or invalid messages array" });
    }
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY environment variable is missing on the server. Please check your deployment settings." });
    }
    const contents = messages.map((m) => ({
      role: m.role === "assistant" || m.role === "model" ? "model" : "user",
      parts: [{ text: m.content }]
    }));
    let finalInstruction = systemInstruction || "You are AkinAI, a highly intelligent and beautiful AI mobile assistant app developed by SASTECH INC. Respond in a friendly, conversational mobile-first layout. Use markdown and formatting gracefully.";
    if (plugins) {
      if (plugins.codeSpecialist) {
        finalInstruction += "\n\nCRITICAL PLUGIN ACTIVE: [Code Specialist]. You must format technical responses with precise, complete code blocks, detailed comments, step-by-step logic, and robust explanations.";
      }
      if (plugins.translator && plugins.translator !== "None") {
        finalInstruction += `

CRITICAL PLUGIN ACTIVE: [Auto Translator]. You MUST translate your final answer entirely to ${plugins.translator}. Ensure grammar is natural and highly readable.`;
      }
      if (plugins.summarizer) {
        finalInstruction += "\n\nCRITICAL PLUGIN ACTIVE: [Executive Summarizer]. Keep your output incredibly concise. Provide the answer in exactly 2 to 3 bulleted points.";
      }
      if (plugins.creativeWriter) {
        finalInstruction += "\n\nCRITICAL PLUGIN ACTIVE: [Creative Writer]. Infuse your answer with literary flair, engaging story structure, helpful analogies, and storytelling style.";
      }
    }
    const tools = [];
    if (plugins?.searchGrounding) {
      tools.push({ googleSearch: {} });
    }
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction: finalInstruction,
        tools: tools.length > 0 ? tools : void 0
      }
    });
    res.json({ text: response.text });
  } catch (error) {
    console.error("Gemini Chat error:", error);
    res.status(500).json({ error: error.message || "Error communicating with Gemini" });
  }
});
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Missing or invalid prompt string" });
    }
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY environment variable is missing on the server. Please check your deployment settings." });
    }
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-image",
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });
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
      res.status(500).json({ error: "No image data returned from Gemini." });
    }
  } catch (error) {
    console.error("Gemini Image generation error:", error);
    res.status(500).json({ error: error.message || "Error generating image" });
  }
});
var isProd = process.env.NODE_ENV === "production";
var isVercel = process.env.VERCEL === "1" || process.env.NOW_REGION !== void 0;
async function bootstrap() {
  if (!isVercel) {
    if (isProd) {
      app.use(express.static(path.resolve(__dirname, "dist")));
      app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "dist", "index.html"));
      });
    } else {
      const { createServer } = await import("vite");
      const vite = await createServer({
        server: { middlewareMode: true },
        appType: "spa"
      });
      app.use(vite.middlewares);
    }
    const port = 3e3;
    app.listen(port, "0.0.0.0", () => {
      console.log(`Server running on port ${port} (mode: ${isProd ? "production" : "development"})`);
    });
  } else {
    console.log("Running in Vercel Serverless environment. Listen skipped.");
  }
}
bootstrap().catch((err) => {
  console.error("Failed to bootstrap server:", err);
});
var server_default = app;
export {
  server_default as default
};
