import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, User, MessageCircle, Copy, Check, Share2 } from 'lucide-react';
import {
  initChatSession,
  sendMessageStream,
  getConversationHistorySnapshot,
  restoreConversationHistory,
  hasConversationHistory,
  type ConversationEntry,
} from '../services/siliconflowService';
import { Message } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const CHAT_CACHE_KEY = 'lovespark.chat.cache.v1';
const MESSAGE_CACHE_LIMIT = 80;
const HISTORY_CACHE_LIMIT = 160;
const CACHE_SAVE_DEBOUNCE_MS = 300;

const INITIAL_ASSISTANT_MESSAGE: Message = {
  role: 'model',
  text: "Hii! ^_^ I'm Cupid's Helper.💖 Ready to raise ya hormone?😉",
  timestamp: new Date(),
};

interface CachedMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

interface ChatCachePayload {
  messages: CachedMessage[];
  draftInput: string;
  conversationHistory: ConversationEntry[];
  savedAt: string;
}

const normalizeMarkdownSpacing = (text: string): string => {
  return text
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const isConversationEntry = (value: unknown): value is ConversationEntry => {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return typeof item.role === 'string' && typeof item.content === 'string';
};

const trimMessagesForCache = (sourceMessages: Message[]): Message[] => {
  return sourceMessages.slice(-MESSAGE_CACHE_LIMIT);
};

const trimConversationForCache = (history: ConversationEntry[]): ConversationEntry[] => {
  const firstSystem = history.find((item) => item.role === 'system');
  const nonSystem = history.filter((item) => item.role !== 'system');
  const latestNonSystem = nonSystem.slice(-HISTORY_CACHE_LIMIT);
  return [...(firstSystem ? [firstSystem] : []), ...latestNonSystem];
};

const parseChatCache = (rawCache: string): ChatCachePayload | null => {
  try {
    const parsed = JSON.parse(rawCache) as Partial<ChatCachePayload>;
    if (!parsed || !Array.isArray(parsed.messages)) return null;

    const validMessages = parsed.messages.every((item) => (
      item &&
      (item.role === 'user' || item.role === 'model') &&
      typeof item.text === 'string' &&
      typeof item.timestamp === 'string'
    ));

    if (!validMessages) return null;

    const conversationHistory = Array.isArray(parsed.conversationHistory)
      ? parsed.conversationHistory.filter(isConversationEntry)
      : [];

    return {
      messages: parsed.messages,
      draftInput: typeof parsed.draftInput === 'string' ? parsed.draftInput : '',
      conversationHistory,
      savedAt: typeof parsed.savedAt === 'string' ? parsed.savedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
};

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([INITIAL_ASSISTANT_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ index: number; action: 'copy' | 'share' } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const feedbackTimerRef = useRef<number | null>(null);

  useEffect(() => {
    let cacheRestored = false;

    try {
      const rawCache = window.localStorage.getItem(CHAT_CACHE_KEY);
      if (rawCache) {
        const parsedCache = parseChatCache(rawCache);
        if (parsedCache) {
          const restoredMessages = parsedCache.messages
            .map((item): Message | null => {
              const timestamp = new Date(item.timestamp);
              if (Number.isNaN(timestamp.getTime())) return null;
              return { role: item.role, text: item.text, timestamp };
            })
            .filter((item): item is Message => item !== null);

          if (restoredMessages.length > 0) {
            setMessages(restoredMessages);
          }

          setInput(parsedCache.draftInput);

          if (parsedCache.conversationHistory.length > 0) {
            restoreConversationHistory(trimConversationForCache(parsedCache.conversationHistory));
          } else if (!hasConversationHistory()) {
            initChatSession();
          }

          cacheRestored = true;
        }
      }
    } catch (error) {
      console.warn('Failed to restore chat cache:', error);
    }

    if (!cacheRestored && !hasConversationHistory()) {
      initChatSession();
    }

    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const timer = window.setTimeout(() => {
      try {
        const payload: ChatCachePayload = {
          messages: trimMessagesForCache(messages).map((item) => ({
            role: item.role,
            text: item.text,
            timestamp: item.timestamp.toISOString(),
          })),
          draftInput: input,
          conversationHistory: trimConversationForCache(getConversationHistorySnapshot()),
          savedAt: new Date().toISOString(),
        };

        window.localStorage.setItem(CHAT_CACHE_KEY, JSON.stringify(payload));
      } catch (error) {
        console.warn('Failed to persist chat cache:', error);
      }
    }, CACHE_SAVE_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [messages, input, isLoading, isHydrated]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current !== null) {
        window.clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  const setFeedbackWithReset = (index: number, action: 'copy' | 'share') => {
    setActionFeedback({ index, action });
    if (feedbackTimerRef.current !== null) {
      window.clearTimeout(feedbackTimerRef.current);
    }
    feedbackTimerRef.current = window.setTimeout(() => {
      setActionFeedback(null);
      feedbackTimerRef.current = null;
    }, 1500);
  };

  const copyTextToClipboard = async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // fallback below
    }

    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      textarea.style.pointerEvents = 'none';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const copied = document.execCommand('copy');
      document.body.removeChild(textarea);
      return copied;
    } catch {
      return false;
    }
  };

  const handleCopyMessage = async (text: string, index: number) => {
    const copied = await copyTextToClipboard(text);
    if (copied) {
      setFeedbackWithReset(index, 'copy');
    }
  };

  const handleShareMessage = async (text: string, index: number) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'LoveSpark Adviser',
          text,
        });
        setFeedbackWithReset(index, 'share');
        return;
      } catch (error) {
        const maybeAbort = error as { name?: string };
        if (maybeAbort?.name === 'AbortError') return;
      }
    }

    const copied = await copyTextToClipboard(text);
    if (copied) {
      setFeedbackWithReset(index, 'share');
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { role: 'user', text: input, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      setMessages((prev) => [...prev, { role: 'model', text: '', timestamp: new Date() }]);

      await sendMessageStream(userMsg.text, (chunkText) => {
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last?.role === 'model') {
            last.text = chunkText;
          }
          return next;
        });
      });
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'model', text: 'x_x Connection lost! Please contact Leo.', timestamp: new Date() }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full flex flex-col min-h-[70vh] max-h-[82vh] sm:min-h-[640px] bg-white rounded-[2.5rem] shadow-[8px_8px_0px_rgba(251,207,232,1)] border-4 border-pink-100 overflow-hidden relative"
    >
      <div className="absolute inset-0 bg-[radial-gradient(#ffe4e6_1.5px,transparent_1.5px)] [background-size:16px_16px] pointer-events-none opacity-50"></div>

      <div className="bg-pink-100 p-3 sm:p-4 flex items-center justify-between border-b-4 border-pink-200 z-10 relative">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="bg-white p-2 rounded-xl border-2 border-pink-200 shadow-sm"
          >
            <MessageCircle className="text-pink-400 w-5 h-5" />
          </motion.div>
          <div>
            <h2 className="text-pink-500 font-pixel text-lg tracking-wide">Adviser</h2>
            <p className="text-pink-300 text-[10px] font-pixel uppercase animate-pulse">Online</p>
          </div>
        </div>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-full bg-pink-300 animate-bounce"></div>
          <div className="w-3 h-3 rounded-full bg-blue-300 animate-bounce delay-75"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-300 animate-bounce delay-150"></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-5 sm:space-y-4 z-10 relative chat-scrollbar">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-full sm:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-2 items-end`}>
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-blue-100 border-blue-200 text-blue-500' : 'bg-pink-100 border-pink-200 text-pink-500'}`}
                >
                  {msg.role === 'user' ? <User size={14} /> : <Sparkles size={14} />}
                </motion.div>

                <div
                  className={`p-4 px-5 text-[16px] sm:text-base leading-7 sm:leading-6 font-medium whitespace-pre-wrap break-words overflow-x-auto shadow-[4px_4px_0px_rgba(0,0,0,0.05)] ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white rounded-[20px] rounded-br-sm border-2 border-blue-600'
                      : 'bg-white text-gray-600 border-2 border-pink-100 rounded-[20px] rounded-bl-sm'
                  }`}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-2 last:mb-0" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-2 last:mb-0" {...props} />,
                      li: ({ node, ...props }) => <li className="mb-1 last:mb-0" {...props} />,
                      table: ({ node, ...props }) => (
                        <div className="my-2 overflow-x-auto">
                          <table className="min-w-[520px] sm:min-w-full border-separate border-spacing-0 text-[14px] sm:text-[15px] leading-6" {...props} />
                        </div>
                      ),
                      thead: ({ node, ...props }) => <thead className="bg-gray-50" {...props} />,
                      th: ({ node, ...props }) => (
                        <th className="border border-gray-200 px-3 py-2 text-left font-semibold whitespace-normal break-words" {...props} />
                      ),
                      td: ({ node, ...props }) => (
                        <td className="border border-gray-200 px-3 py-2 align-top whitespace-normal break-words" {...props} />
                      )
                    }}
                  >
                    {normalizeMarkdownSpacing(msg.text)}
                  </ReactMarkdown>

                  {msg.role === 'model' && msg.text.trim() && (
                    <div className="mt-3 flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleCopyMessage(msg.text, idx)}
                        className="p-1.5 rounded-lg bg-pink-50/70 hover:bg-pink-100 text-pink-500 transition-colors"
                        title="Copy"
                        aria-label="Copy response"
                      >
                        {actionFeedback?.index === idx && actionFeedback.action === 'copy'
                          ? <Check size={14} />
                          : <Copy size={14} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleShareMessage(msg.text, idx)}
                        className="p-1.5 rounded-lg bg-pink-50/70 hover:bg-pink-100 text-pink-500 transition-colors"
                        title="Share"
                        aria-label="Share response"
                      >
                        {actionFeedback?.index === idx && actionFeedback.action === 'share'
                          ? <Check size={14} />
                          : <Share2 size={14} />}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 sm:p-4 bg-white/80 backdrop-blur border-t-4 border-pink-100 z-10 relative">
        <div className="flex gap-2 items-center bg-gray-50 rounded-[20px] sm:rounded-full pl-4 sm:pl-5 pr-2 py-2.5 border-2 border-gray-200 focus-within:border-pink-300 focus-within:bg-white focus-within:shadow-[0_0_15px_rgba(244,114,182,0.2)] transition-all">
          <input
            type="text"
            className="flex-1 bg-transparent outline-none text-[16px] sm:text-base text-gray-600 placeholder-gray-400 font-medium"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
          />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-3 bg-pink-400 hover:bg-pink-500 active:scale-95 text-white rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[2px_2px_0px_rgba(190,24,93,1)]"
          >
            <Send size={16} fill="white" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatBot;
