/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { geminiService } from "../src/services/geminiService";

// This file is designed for Vercel/Serverless deployment or as a reference for the Express server
export default async function handler(req: any, res: any) {
  // Twilio sends data as URL-encoded POST body
  const message = req.body.Body || req.query.Body;
  const from = req.body.From || req.query.From;

  console.log(`Incoming WhatsApp message from ${from}: ${message}`);

  if (!message) {
    res.setHeader("Content-Type", "text/xml");
    return res.status(200).send('<Response><Message>No message received.</Message></Response>');
  }

  try {
    // Call the AI Service directly
    const reply = await geminiService.generateResponse(message, [], 'creative');

    res.setHeader("Content-Type", "text/xml");
    res.status(200).send(`
      <Response>
        <Message>${reply}</Message>
      </Response>
    `);
  } catch (error: any) {
    console.error("WhatsApp AI Route Error:", error);
    res.setHeader("Content-Type", "text/xml");
    res.status(200).send(`
      <Response>
        <Message>AkinAI: I'm having trouble processing your message. Please try again later.</Message>
      </Response>
    `);
  }
}
