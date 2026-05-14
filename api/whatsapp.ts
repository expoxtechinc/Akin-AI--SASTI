/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// This file is designed for Vercel/Serverless deployment or as a reference for the Express server
export default async function handler(req: any, res: any) {
  const message = req.body.Body || req.query.Body;

  try {
    const ai = await fetch("https://akinai-official.vercel.app/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const data = await ai.json();

    res.setHeader("Content-Type", "text/xml");
    res.status(200).send(`
      <Response>
        <Message>${data.reply}</Message>
      </Response>
    `);
  } catch (error) {
    res.setHeader("Content-Type", "text/xml");
    res.status(500).send(`
      <Response>
        <Message>Error processing AI request.</Message>
      </Response>
    `);
  }
}
