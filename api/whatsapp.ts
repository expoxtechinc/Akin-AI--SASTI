/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
    // Attempt to call the AI Chat endpoint
    const aiResponse = await fetch("https://akinai-official.vercel.app/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, from })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      throw new Error(`AI API error: ${aiResponse.status} - ${errorText}`);
    }

    const data = await aiResponse.json();
    const reply = data.reply || data.message || "My brain is a bit foggy, could you repeat that?";

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
        <Message>AkinAI: I'm having trouble connecting to my central brain. Please check the logs.</Message>
      </Response>
    `);
  }
}
