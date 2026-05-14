/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getAIResponse } from "../src/services/geminiService.js";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const text = await getAIResponse(message);
    return res.status(200).json({ reply: text });
  } catch (error: any) {
    console.error('Chat Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
