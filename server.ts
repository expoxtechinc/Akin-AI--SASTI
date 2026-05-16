import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import twilio from 'twilio';
import dotenv from 'dotenv';
import { geminiCore } from "./src/services/geminiCore";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // AI Chat Route (Non-streaming)
  app.post("/api/chat", async (req, res) => {
    const { message, history, personality, attachments } = req.body;
    console.log("Chat Request:", message);
    try {
      const reply = await geminiCore.generateResponse(message, history, personality, attachments);
      res.json({ reply });
    } catch (error: any) {
      console.error("Chat Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // AI Chat Route (Streaming SSE)
  app.post("/api/chat/stream", async (req, res) => {
    const { message, history, personality, attachments } = req.body;
    console.log("Stream Request:", message);
    
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      const stream = geminiCore.generateResponseStream(message, history, personality, attachments);
      for await (const chunk of stream) {
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      }
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error: any) {
      console.error("Stream Error:", error);
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  });

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

  // Twilio WhatsApp Webhook (TwiML)
  app.post("/api/whatsapp", async (req, res) => {
    // Twilio sends data in x-www-form-urlencoded format
    const message = req.body.Body || req.query.Body;
    const from = req.body.From || req.query.From;

    console.log(`Incoming Local Webhook from ${from}: ${message}`);

    res.setHeader("Content-Type", "text/xml");
    res.status(200).send(`
      <Response>
        <Message>AkinAI: Message received. Processing is currently handled in the web interface.</Message>
      </Response>
    `);
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
