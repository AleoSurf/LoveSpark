import { DateIdea } from '../types';
import { SYSTEM_INSTRUCTION } from '../constants';

const API_BASE_URL = 'https://api.siliconflow.com/v1/chat/completions';
const MODEL_NAME = 'openai/gpt-oss-20b';

interface SiliconFlowChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
  }>;
}

export type ConversationEntry = { role: string; content: string };

const getApiKey = (): string => {
  const apiKey = import.meta.env.VITE_SILICONFLOW_API_KEY;
  if (!apiKey) {
    console.warn('SiliconFlow API Key is missing! Ensure VITE_SILICONFLOW_API_KEY is set in .env file.');
  }
  return apiKey || '';
};

let conversationHistory: ConversationEntry[] = [];

const createSystemMessage = (): ConversationEntry => ({
  role: 'system',
  content: SYSTEM_INSTRUCTION,
});

const sanitizeConversationHistory = (history: ConversationEntry[]): ConversationEntry[] => {
  const validItems = history.filter((item) => (
    item &&
    typeof item.role === 'string' &&
    item.role.trim().length > 0 &&
    typeof item.content === 'string'
  ));

  const nonSystemItems = validItems.filter((item) => item.role !== 'system');
  return [createSystemMessage(), ...nonSystemItems];
};

const ensureConversationInitialized = (): void => {
  if (conversationHistory.length === 0) {
    conversationHistory = [createSystemMessage()];
  }
};

export const initChatSession = (forceReset = false): void => {
  if (forceReset || conversationHistory.length === 0) {
    conversationHistory = [createSystemMessage()];
  }
};

export const hasConversationHistory = (): boolean => {
  return conversationHistory.length > 1;
};

export const getConversationHistorySnapshot = (): ConversationEntry[] => {
  return conversationHistory.map((item) => ({ ...item }));
};

export const restoreConversationHistory = (history: ConversationEntry[]): void => {
  if (!Array.isArray(history) || history.length === 0) {
    initChatSession(true);
    return;
  }

  const normalized = sanitizeConversationHistory(history);
  if (normalized.length === 0) {
    initChatSession(true);
    return;
  }

  conversationHistory = normalized;
};

export const sendMessageStream = async (
  message: string,
  onChunk: (text: string) => void
): Promise<void> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('API Key is missing');
  }

  ensureConversationInitialized();
  conversationHistory.push({ role: 'user', content: message });

  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      messages: conversationHistory,
      stream: true,
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${error}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Failed to get response reader');
  }

  const decoder = new TextDecoder();
  let fullResponse = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;

      const data = line.slice(6);
      if (data === '[DONE]') continue;

      try {
        const parsed: SiliconFlowChunk = JSON.parse(data);
        const content = parsed.choices[0]?.delta?.content;
        if (content) {
          fullResponse += content;
          onChunk(fullResponse);
        }
      } catch {
        // Ignore stream parse errors.
      }
    }
  }

  conversationHistory.push({ role: 'assistant', content: fullResponse });
};

const ROMANTIC_EMOJIS = ['💕', '🌹', '💐', '💝', '💖', '💗', '💓', '💌', '🌸', '💮', '🏩', '🎁', '🍷', '🕯️', '🎵', '💃', '🧡', '🩷', '🤍', '🩵', '🗼', '🌊', '🍜', '🎆', '☕', '🚲', '🎨', '🌆', '🛥️', '💎'];

function extractEmojis(text: string): string[] {
  const emojiPattern = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
  return text.match(emojiPattern) || [];
}

export const generateDateIdea = async (mood: string): Promise<DateIdea> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('API Key is missing');
  }

const prompt = `You are LoveSpark's Gen-Z activity date architect.

STYLE DNA:
- Dates must be activity-based.
- Avoid passive formats (NO CLUE , MAZE nothing include guess riddle and hunt).
- Every idea must include a built-in mechanic (challenge, rule, twist, competition, role-play, or creative outcome).

Energy:
Playful, chaotic, witty, a little self-aware. Gen-Z coded but not cringe.

Generate ONE date idea based on this mood/theme: "${mood}".

It must:
- Feel like a structured activity (not hanging out).
- Include a clear action sequence.
- Include a playful hook or rule.
- Avoid overused these words: moonlit, neon, midnight, stroll, cafe, picnic, rooftop, cocktails, city lights.
- Not revolve around just eating/drinking.

IMPORTANT: Respond with a valid JSON object only (no markdown):

{
  "title": "Catchy creative title with 1-3 fitting emojis",
  "description": "1-2 vivid sentences (max 25 words). Include specific actions + why it's fun/romantic. End with 2-3 fitting romantic emojis.",
  "duration": "Realistic time range (e.g. 1.5-2.5 hours)",
  "budget": "2-6 DIFFERENT emojis that match cost/vibe",
  "vibe": "1-3 words (e.g. mood & activities)"
}

Each Mood must belong to a DIFFERENT category.
No markdown. Pure JSON only.`;


  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: SYSTEM_INSTRUCTION },
        { role: 'user', content: prompt }
      ],
      stream: false,
      temperature: 0.95,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error('No content in response');
  }

  try {
    const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
    const idea = JSON.parse(cleanJson) as DateIdea;

    const currentEmojis = extractEmojis(idea.budget);

    if (currentEmojis.length >= 2 && currentEmojis.length <= 7) {
      idea.budget = currentEmojis.join('');
    } else if (currentEmojis.length > 6) {
      idea.budget = currentEmojis.slice(0, 6).join('');
    } else if (currentEmojis.length > 0) {
      while (currentEmojis.length < 2) {
        const randomEmoji = ROMANTIC_EMOJIS[Math.floor(Math.random() * ROMANTIC_EMOJIS.length)];
        if (!currentEmojis.includes(randomEmoji)) {
          currentEmojis.push(randomEmoji);
        }
      }
      idea.budget = currentEmojis.join('');
    } else {
      const shuffled = [...ROMANTIC_EMOJIS].sort(() => 0.5 - Math.random());
      idea.budget = shuffled.slice(0, 3).join('');
    }

    return idea;
  } catch {
    console.error('Failed to parse date idea JSON:', content);
    const shuffled = [...ROMANTIC_EMOJIS].sort(() => 0.5 - Math.random());
    return {
      title: 'Gen-Z Creative Date Idea',
      description: content,
      duration: '2h',
      budget: shuffled.slice(0, 3).join(''),
      vibe: 'Romantic'
    };
  }
};
