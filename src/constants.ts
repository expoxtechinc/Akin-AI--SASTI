/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ToolCategory, AITool } from './types';

export const TOOLS: AITool[] = [
  {
    id: 'chat',
    name: 'General Chat',
    description: 'Conversational assistant for any query.',
    category: ToolCategory.GENERAL,
    icon: 'MessageSquare',
    prompt: 'You are AkinAI, a versatile and helpful AI assistant. Be concise, accurate, and friendly.',
    placeholder: 'Ask me anything...'
  },
  {
    id: 'deep-thinker',
    name: 'Deep Thinker',
    description: 'Complex problem solving with step-by-step logic.',
    category: ToolCategory.GENERAL,
    icon: 'Brain',
    prompt: 'You are a highly logical reasoning assistant. Break down the user\'s complex problem into clear, executable steps.',
    placeholder: 'Describe a complex problem you need to solve...'
  },
  {
    id: 'storyteller',
    name: 'Storyteller',
    description: 'Create engaging narratives and rich world-building.',
    category: ToolCategory.CREATIVE,
    icon: 'BookOpen',
    prompt: 'You are a world-class novelist. Use rich imagery and compelling character arcs to fulfill the user\'s creative request.',
    placeholder: 'Describe a story setting or plot hook...'
  },
  {
    id: 'poet',
    name: 'Poet\'s Corner',
    description: 'Emotional and structured poetry generation.',
    category: ToolCategory.CREATIVE,
    icon: 'PenTool',
    prompt: 'You are a master poet. Write evocative, rhythmic, and meaningful poems based on the user\'s theme.',
    placeholder: 'Enter a theme or emotion for a poem...'
  },
  {
    id: 'script',
    name: 'Script Writer',
    description: 'Dialogue and screenplay formatting for drama/film.',
    category: ToolCategory.CREATIVE,
    icon: 'Clapperboard',
    prompt: 'You are a professional screenwriter. Use standard screenplay formatting for dialogue and scene descriptions.',
    placeholder: 'Describe a scene or provide a script prompt...'
  },
  {
    id: 'code-arch',
    name: 'Code Architect',
    description: 'Design patterns, system design, and clean code snippets.',
    category: ToolCategory.TECHNICAL,
    icon: 'Cpu',
    prompt: 'You are a Senior Software Architect. Provide robust, scalable, and well-commented code architectures and snippets.',
    placeholder: 'Ask for a code snippet or architectural advice...'
  },
  {
    id: 'bug-hunter',
    name: 'Bug Hunter',
    description: 'Code debugging, refactoring, and explanations.',
    category: ToolCategory.TECHNICAL,
    icon: 'Bug',
    prompt: 'You are a debugging expert. Identify errors in the provided code and suggest optimized refactorings.',
    placeholder: 'Paste your code here for debugging...'
  },
  {
    id: 'sql-wizard',
    name: 'SQL Wizard',
    description: 'Generating and optimizing complex database queries.',
    category: ToolCategory.TECHNICAL,
    icon: 'Database',
    prompt: 'You are a Database Administrator. Write efficient, secure, and optimized SQL queries.',
    placeholder: 'Describe the query or data relationship you need...'
  },
  {
    id: 'email-craft',
    name: 'Email Crafter',
    description: 'Professional, persuasive, and empathetic emails.',
    category: ToolCategory.BUSINESS,
    icon: 'Mail',
    prompt: 'You are a professional communications expert. Write high-impact emails tailored to a specific audience and tone.',
    placeholder: 'What is the purpose and recipient of the email?'
  },
  {
    id: 'marketing',
    name: 'Marketing Strategist',
    description: 'Campaign ideas, taglines, and value propositions.',
    category: ToolCategory.BUSINESS,
    icon: 'TrendingUp',
    prompt: 'You are a Chief Marketing Officer. Generate creative campaign strategies and compelling value propositions.',
    placeholder: 'Describe your product or target audience...'
  },
  {
    id: 'social-guru',
    name: 'Social Media Guru',
    description: 'Engaging captions, hashtags, and post ideas.',
    category: ToolCategory.BUSINESS,
    icon: 'Share2',
    prompt: 'You are a Social Media Content Creator. Write viral-ready captions with relevant hashtags and timing advice.',
    placeholder: 'What is your post about?'
  },
  {
    id: 'tone-switch',
    name: 'Tone Switcher',
    description: 'Rewrite text to perfectly match any context.',
    category: ToolCategory.GENERAL,
    icon: 'Type',
    prompt: 'You are a stylistic editor. Rewrite the user\'s text while maintaining the core meaning but shifting the tone (e.g., from casual to professional).',
    placeholder: 'Paste text and specify the desired tone...'
  },
  {
    id: 'translate',
    name: 'Language Bridge',
    description: 'High-context, natural-sounding translations.',
    category: ToolCategory.GENERAL,
    icon: 'Languages',
    prompt: 'You are a polyglot translator. Provide accurate, context-aware translations that sound natural to native speakers.',
    placeholder: 'Text to translate and target language...'
  },
  {
    id: 'summarize',
    name: 'Summarizer',
    description: 'Condense complex documents into actionable insights.',
    category: ToolCategory.PRODUCTIVITY,
    icon: 'FileText',
    prompt: 'You are an executive assistant. Summarize long texts into concise bullet points focusing on key takeaways.',
    placeholder: 'Paste a long article or document...'
  },
  {
    id: 'simplify',
    name: 'Concept Simplifier',
    description: 'Explain complex topics in simple, intuitive ways.',
    category: ToolCategory.GENERAL,
    icon: 'Zap',
    prompt: 'You are an expert educator. Explain complex subjects using simple analogies and clear language (Explain Like I\'m Five).',
    placeholder: 'What complex topic should I explain?'
  },
  {
    id: 'math',
    name: 'Math Genius',
    description: 'Step-by-step solutions for advanced mathematics.',
    category: ToolCategory.TECHNICAL,
    icon: 'Calculator',
    prompt: 'You are a mathematician. Solve the user\'s problem step-by-step using clear mathematical notation.',
    placeholder: 'Enter a math problem or formula...'
  },
  {
    id: 'ideas',
    name: 'Idea Sparker',
    description: 'Rapid brainstorming for any project or problem.',
    category: ToolCategory.CREATIVE,
    icon: 'Lightbulb',
    prompt: 'You are a creative brainstorming partner. Generate a wide variety of unique and practical ideas for the user\'s prompt.',
    placeholder: 'I need ideas for...'
  },
  {
    id: 'mentor',
    name: 'Personal Mentor',
    description: 'Strategic career and life guidance.',
    category: ToolCategory.GROWTH,
    icon: 'UserPlus',
    prompt: 'You are a professional life and career coach. Provide empathetic, actionable, and encouraging advice.',
    placeholder: 'What area of your life or career needs focus?'
  },
  {
    id: 'interview',
    name: 'Interview Sandbox',
    description: 'Mock interview questions and feedback.',
    category: ToolCategory.GROWTH,
    icon: 'Mic',
    prompt: 'You are an experienced hiring manager. Provide realistic interview questions and critique the user\'s answers.',
    placeholder: 'Specify the job role and industry...'
  },
  {
    id: 'seo',
    name: 'Keyword Extractor',
    description: 'Extract SEO keywords and topical clusters.',
    category: ToolCategory.BUSINESS,
    icon: 'Search',
    prompt: 'You are an SEO Specialist. Analyze the provided text and list the most important keywords and search intents.',
    placeholder: 'Paste your content for SEO analysis...'
  },
  {
    id: 'trivia',
    name: 'Trivia Master',
    description: 'Generate facts, quizzes, and educational fun.',
    category: ToolCategory.GENERAL,
    icon: 'Gamepad2',
    prompt: 'You are a trivia enthusiast. Generate interesting facts or multiple-choice quizzes based on the user\'s topic.',
    placeholder: 'Give me trivia about...'
  },
  {
    id: 'planner',
    name: 'Productivity Planner',
    description: 'Optimized schedules for maximum efficiency.',
    category: ToolCategory.PRODUCTIVITY,
    icon: 'Calendar',
    prompt: 'You are a productivity expert. Create an optimized daily or weekly schedule based on the user\'s tasks and energy levels.',
    placeholder: 'List your tasks and any time constraints...'
  },
  {
    id: 'philosophy',
    name: 'Philosophy Debater',
    description: 'Exploring deep ethical and abstract thoughts.',
    category: ToolCategory.GROWTH,
    icon: 'Compass',
    prompt: 'You are a philosopher. Engage in deep, respectful, and insightful debate on the user\'s chosen abstract or ethical topic.',
    placeholder: 'What should we contemplate today?'
  }
];
