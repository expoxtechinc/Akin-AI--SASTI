/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { geminiCore } from "../src/services/geminiCore";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, personality, history, attachments } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const text = await geminiCore.generateResponse(message, history, personality, attachments);
    return res.status(200).json({ reply: text });
  } catch (error: any) {
    console.error('Chat Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}
