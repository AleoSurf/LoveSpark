import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, User, Heart, MessageCircle } from 'lucide-react';
import { initChatSession, sendMessageStream } from '../services/siliconflowService';
import { Message } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hii! ^_^ I'm Cupid's Helper.💖 Ready to raise ya hormone?😉", timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initChatSession();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      setMessages(prev => [
        ...prev,
        { role: 'model', text: '', timestamp: new Date() }
      ]);

      await sendMessageStream(userMsg.text, (chunkText) => {
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg.role === 'model') {
            lastMsg.text = chunkText;
          }
          return newMessages;
        });
      });

    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "x_x Connection lost! Pls call Leo.", timestamp: new Date() }]);
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
      className="flex flex-col h-[600px] bg-white rounded-[2.5rem] shadow-[8px_8px_0px_rgba(251,207,232,1)] border-4 border-pink-100 overflow-hidden relative"
    >
      
      {/* Cute Background Pattern for Chat */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffe4e6_1.5px,transparent_1.5px)] [background-size:16px_16px] pointer-events-none opacity-50"></div>

      {/* Header */}
      <div className="bg-pink-100 p-4 flex items-center justify-between border-b-4 border-pink-200 z-10 relative">
        <div className="flex items-center gap-3">
          <motion.div 
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="bg-white p-2 rounded-xl border-2 border-pink-200 shadow-sm"
          >
            <MessageCircle className="text-pink-400 w-5 h-5" />
          </motion.div>
          <div>
            <h2 className="text-pink-500 font-pixel text-lg tracking-wide">Adviser 🧸</h2>
            <p className="text-pink-300 text-[10px] font-pixel uppercase animate-pulse">Online ●</p>
          </div>
        </div>
        <div className="flex gap-1">
            <div className="w-3 h-3 rounded-full bg-pink-300 animate-bounce"></div>
            <div className="w-3 h-3 rounded-full bg-blue-300 animate-bounce delay-75"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-300 animate-bounce delay-150"></div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 z-10 relative scrollbar-hide">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-2 items-end`}>
                {/* Avatar */}
                <motion.div 
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-blue-100 border-blue-200 text-blue-500' : 'bg-pink-100 border-pink-200 text-pink-500'}`}
                >
                  {msg.role === 'user' ? <User size={14} /> : <Sparkles size={14} />}
                </motion.div>
                
                {/* Bubble */}
                <div 
                  className={`p-3.5 px-5 text-sm md:text-base leading-relaxed font-medium shadow-[4px_4px_0px_rgba(0,0,0,0.05)] ${
                    msg.role === 'user' 
                      ? 'bg-blue-500 text-white rounded-[20px] rounded-br-sm border-2 border-blue-600' 
                      : 'bg-white text-gray-600 border-2 border-pink-100 rounded-[20px] rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white/80 backdrop-blur border-t-4 border-pink-100 z-10 relative">
        <div className="flex gap-2 items-center bg-gray-50 rounded-full pl-5 pr-2 py-2 border-2 border-gray-200 focus-within:border-pink-300 focus-within:bg-white focus-within:shadow-[0_0_15px_rgba(244,114,182,0.2)] transition-all">
          <input
            type="text"
            className="flex-1 bg-transparent outline-none text-gray-600 placeholder-gray-400 font-medium"
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
