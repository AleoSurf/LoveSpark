import { Message, DateIdea } from '../types';
import { SYSTEM_INSTRUCTION } from '../constants';

// SiliconFlow API 配置
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
      role: string;
      content: string;
    };
    finish_reason: string | null;
  }>;
}

const getApiKey = (): string => {
  const apiKey = import.meta.env.VITE_SILICONFLOW_API_KEY;
  if (!apiKey) {
    console.warn("SiliconFlow API Key is missing! Ensure VITE_SILICONFLOW_API_KEY is set in .env file.");
  }
  return apiKey || '';
};

// 对话历史存储（用于流式对话）
let conversationHistory: Array<{ role: string; content: string }> = [];

export const initChatSession = (): void => {
  // 初始化时设置系统指令
  conversationHistory = [
    { role: 'system', content: SYSTEM_INSTRUCTION }
  ];
};

export const sendMessageStream = async (
  message: string,
  onChunk: (text: string) => void
): Promise<void> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('API Key is missing');
  }

  // 添加用户消息到历史
  conversationHistory.push({ role: 'user', content: message });

  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
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
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;

        try {
          const parsed: SiliconFlowChunk = JSON.parse(data);
          const content = parsed.choices[0]?.delta?.content;
          if (content) {
            fullResponse += content;
            onChunk(fullResponse);
          }
        } catch (e) {
          // 忽略解析错误
        }
      }
    }
  }

  // 保存助手回复到历史
  conversationHistory.push({ role: 'assistant', content: fullResponse });
};

// 浪漫emoji池
const ROMANTIC_EMOJIS = ['💕', '🌹', '💐', '💝', '💖', '💗', '💓', '💌', '🌸', '💮', '🏩', '🎁', '🍷', '🕯️', '🎵', '💃', '🧡', '🩷', '🤍', '🩵', '🗼', '🌊', '🍜', '🎆', '☕', '🚲', '🎨', '🌆', '🛥️', '💎'];

// 提取emoji的工具函数
function extractEmojis(text: string): string[] {
  const emojiPattern = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
  return text.match(emojiPattern) || [];
}

export const generateDateIdea = async (mood: string): Promise<DateIdea> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('API Key is missing');
  }

  const prompt = `You are a Gen Z dating curator with a NewJeans-core aesthetic. Create a creative, romantic date itinerary based on this mood/theme: "${mood}".

IMPORTANT: Respond with a valid JSON object (no markdown):

{
  "title": "Catchy activity title with 2-3 perfect Y2K emojis",
  "description": "Write this like a trending, high-vibe Xiaohongshu Gen-Z date suggestion post.
  (List each action on a NEW LINE starting with a unique emoji. Don't use fancy words and sounds like AI, all in 50 Words):
✨ [Action 1]
🎞️ [Action 2]Romance in the realistic way
🍦 [Action 3]
  Use minimal slang, focus on 'visual' storytelling with corresponding emoji",

  "duration": "Time (e.g. 2.5h)",
  "budget": "2-7 romantic emojis that perfectly capture the vibe",
  "vibe": "One word (e.g., Dreamy, Cozy, Vibrant)"
}

Requirements:
🎯 Must mention REAL locations in Paris or Guangdong-Hong Kong-Macao Greater Bay Area:

- NEVER use '1, 2, 3' or blocky paragraphs for actions. 
- Every 'Move' must have its own line.
- Tone: Ethereal, relaxed, 'NewJeans-core'.

🎁 TOGGLES - List 2-4 creative and relevant items/objects needed for this date. Be imaginative!
   • Format: "• [Emoji] [Item Name]" (e.g., "• 📸 Vintage Camera")
   • Include these at the end of the description, separated by a newline.

✨ Style: Emotional, poetic, visual. Use Creative emojis throughout the description.
💰 Budget: Choose 2-6 DIFFERENT emojis that genuinely represent the romantic mood.

Pure JSON only, no markdown.`;

  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: SYSTEM_INSTRUCTION },
        { role: 'user', content: prompt }
      ],
      stream: false,
      temperature: 0.8,
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

  // 解析 JSON 响应
  try {
    const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
    const idea = JSON.parse(cleanJson) as DateIdea;
    
    // 确保 budget 有2-7个浪漫emoji
    const currentEmojis = extractEmojis(idea.budget);
    
    if (currentEmojis.length >= 2 && currentEmojis.length <= 7) {
      // 保持模型返回的数量
      idea.budget = currentEmojis.join('');
    } else if (currentEmojis.length > 6) {
      idea.budget = currentEmojis.slice(0, 6).join('');
    } else if (currentEmojis.length > 0) {
      // 补充到至少2个
      while (currentEmojis.length < 2) {
        const randomEmoji = ROMANTIC_EMOJIS[Math.floor(Math.random() * ROMANTIC_EMOJIS.length)];
        if (!currentEmojis.includes(randomEmoji)) {
          currentEmojis.push(randomEmoji);
        }
      }
      idea.budget = currentEmojis.join('');
    } else {
      // 完全没有emoji，随机选择3个
      const shuffled = [...ROMANTIC_EMOJIS].sort(() => 0.5 - Math.random());
      idea.budget = shuffled.slice(0, 3).join('');
    }
    
    return idea;
  } catch (e) {
    console.error('Failed to parse date idea JSON:', content);
    const shuffled = [...ROMANTIC_EMOJIS].sort(() => 0.5 - Math.random());
    return {
      title: "✨ Dreamy Date Idea",
      description: content,
      duration: "2h",
      budget: shuffled.slice(0, 3).join(''),
      vibe: "Romantic"
    };
  }
};
