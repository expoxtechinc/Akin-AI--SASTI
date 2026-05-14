/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(
      `You are AkinAI, a helpful and intelligent WhatsApp assistant. 
       Answer the user concisely and friendly.
       User message: ${message}`
    );

    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ reply: text });
  } catch (error: any) {
    console.error('Chat Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
