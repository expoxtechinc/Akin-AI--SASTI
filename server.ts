import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Twilio Proxy Route
  app.post("/api/whatsapp/send", async (req, res) => {
    const { to, body, contentSid, contentVariables } = req.body;
    
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

    if (!accountSid || !authToken) {
      return res.status(500).json({ error: "Twilio credentials missing on server" });
    }

    const client = twilio(accountSid, authToken);

    try {
      const messageParams: any = {
        from,
        to,
      };

      if (contentSid) {
        messageParams.contentSid = contentSid;
        if (contentVariables) {
          messageParams.contentVariables = JSON.stringify(contentVariables);
        }
      } else {
        messageParams.body = body;
      }

      const message = await client.messages.create(messageParams);
      res.json({ success: true, sid: message.sid });
    } catch (error: any) {
      console.error("Twilio Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Standalone AI Chat Route
  app.post("/api/chat", async (req, res) => {
    const { message } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return res.status(500).json({ error: "Gemini API key missing" });

    try {
       // Logic similar to api/chat.ts for matching behavior
       const result = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           contents: [{ parts: [{ text: `You are AkinAI. Reply concisely: ${message}` }] }]
         })
       });
       const data = await result.json();
       const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm thinking...";
       res.json({ reply });
    } catch (e) {
       res.status(500).json({ error: "AI failed" });
    }
  });

  // Twilio WhatsApp Webhook (TwiML)
  app.post("/api/whatsapp", async (req, res) => {
    // Twilio sends data in x-www-form-urlencoded format
    const message = req.body.Body || req.query.Body;
    const from = req.body.From || req.query.From;

    console.log(`Incoming Local Webhook from ${from}: ${message}`);

    if (!message) {
      res.setHeader("Content-Type", "text/xml");
      return res.status(200).send('<Response><Message>No message body detected.</Message></Response>');
    }

    try {
      // Call the AI chat endpoint on your main Vercel app
      const aiResponse = await fetch("https://akinai-official.vercel.app/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, from })
      });

      if (!aiResponse.ok) {
        throw new Error(`AI API failed with status ${aiResponse.status}`);
      }

      const data = await aiResponse.json();
      const reply = data.reply || data.message || "I'm processing, but couldn't find a direct answer.";

      res.setHeader("Content-Type", "text/xml");
      res.status(200).send(`
        <Response>
          <Message>${reply}</Message>
        </Response>
      `);
    } catch (error) {
      console.error("Webhook AI Error:", error);
      res.setHeader("Content-Type", "text/xml");
      res.status(200).send(`
        <Response>
          <Message>AkinAI Context Error: The connection to your AI brain at akinai-official was interrupted.</Message>
        </Response>
      `);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
