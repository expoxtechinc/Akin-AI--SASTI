/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface WhatsAppMessageParams {
  to: string;
  body?: string;
  contentSid?: string;
  contentVariables?: Record<string, string>;
}

export async function sendWhatsAppMessage(params: WhatsAppMessageParams) {
  try {
    const response = await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to send message');
    }

    return data;
  } catch (error: any) {
    console.error('Service Error:', error);
    throw error;
  }
}
