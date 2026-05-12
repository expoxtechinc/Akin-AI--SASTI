/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LucideIcon } from 'lucide-react';

export enum ToolCategory {
  GENERAL = 'General',
  CREATIVE = 'Creative',
  TECHNICAL = 'Technical',
  BUSINESS = 'Business',
  PRODUCTIVITY = 'Productivity',
  GROWTH = 'Growth',
  EDUCATION = 'Education'
}

export interface AITool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: string; // Icon name string
  prompt: string;
  placeholder: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
