import React, { useState } from 'react';
import { RefreshCw, Clock, Lightbulb, Music, Sparkles } from 'lucide-react';
import { generateDateIdea } from '../services/siliconflowService';
import { INITIAL_DATE_IDEAS } from '../constants';
import { DateIdea } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const DateIdeaCard: React.FC = () => {
  const [currentIdea, setCurrentIdea] = useState<DateIdea>(() => {
    const randomIndex = Math.floor(Math.random() * INITIAL_DATE_IDEAS.length);
    return INITIAL_DATE_IDEAS[randomIndex];
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [customMood, setCustomMood] = useState('');

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      if (customMood.trim()) {
        const idea = await generateDateIdea(customMood);
        setCurrentIdea(idea);
      } else if (Math.random() > 0.5) {
        const idea = await generateDateIdea('Surprise me with something romantic and spontaneous');
        setCurrentIdea(idea);
      } else {
        const random = INITIAL_DATE_IDEAS[Math.floor(Math.random() * INITIAL_DATE_IDEAS.length)];
        setCurrentIdea(random);
      }
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRandomLocal = () => {
    const random = INITIAL_DATE_IDEAS[Math.floor(Math.random() * INITIAL_DATE_IDEAS.length)];
    setCurrentIdea(random);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="
        group relative bg-white rounded-[2.5rem] p-6 md:p-8 border-4 border-blue-100 h-full flex flex-col overflow-hidden
        transition-all duration-300
        hover:scale-[1.01] hover:z-20
        hover:shadow-[12px_12px_0px_rgba(191,219,254,1)]
        hover:border-blue-300
      "
    >
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-pink-100 rounded-full blur-2xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        className="absolute top-6 right-6 text-2xl"
      >
        ✨
      </motion.div>
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-6 left-6 text-xl"
      >
        💿
      </motion.div>

      <div className="flex items-center justify-between mb-6 relative z-10">
        <h2 className="text-xl font-bold text-blue-500 font-pixel flex items-center gap-2">
          <Music size={20} className="text-pink-400" />
          Date.mp3
        </h2>
        <motion.span
          key={currentIdea.vibe}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-r from-pink-200 to-blue-200 text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold font-pixel uppercase tracking-wide border-2 border-white shadow-sm"
        >
          {currentIdea.vibe}
        </motion.span>
      </div>

      <div className="flex-1 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdea.title}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-blue-50/50 rounded-2xl p-6 mb-6 border-2 border-blue-100 shadow-inner"
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-3 flex items-center gap-2">
              {currentIdea.title}
              <Sparkles size={18} className="text-yellow-400" />
            </h3>
            <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line font-medium">
              {currentIdea.description}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <motion.div
            whileHover={{ y: -5 }}
            className="flex items-center gap-2 text-gray-600 bg-white border-2 border-pink-100 p-3 rounded-2xl shadow-sm"
          >
            <Clock size={20} className="text-pink-400" />
            <span className="text-sm font-bold">{currentIdea.duration}</span>
          </motion.div>
          <motion.div
            whileHover={{ y: -5 }}
            className="flex items-center gap-2 text-gray-600 bg-white border-2 border-blue-100 p-3 rounded-2xl shadow-sm"
          >
            <span className="text-xl">💏</span>
            <span className="text-sm font-bold">{currentIdea.budget}</span>
          </motion.div>
        </div>
      </div>

      <div className="border-t-4 border-dashed border-gray-100 pt-6 relative z-10">
        <label className="block text-xs font-pixel text-gray-400 mb-3 uppercase tracking-wider">Customize Vibe</label>
        <div className="flex flex-col sm:flex-row gap-3 sm:pr-2">
          <input
            type="text"
            placeholder="Type a mood... (e.g. cozy)"
            className="flex-1 bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all placeholder-gray-400 text-gray-700 font-medium"
            value={customMood}
            onChange={(e) => setCustomMood(e.target.value)}
          />
          <div className="flex gap-3 sm:ml-auto items-center">
            <motion.button
              type="button"
              animate={isGenerating ? {} : { y: [0, -4, 0] }}
              transition={isGenerating ? {} : { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              whileHover={isGenerating ? {} : { scale: 1.18, rotate: [0, -8, 8, -6, 0], y: -6 }}
              whileTap={isGenerating ? {} : { scale: 0.86, rotate: -10 }}
              onClick={handleRandomLocal}
              disabled={isGenerating}
              title="Random idea"
              aria-label="Random idea"
              className="
                bg-transparent border-0 outline-none
                text-4xl sm:text-5xl leading-none p-1
                drop-shadow-[0_4px_10px_rgba(16,185,129,0.5)] hover:drop-shadow-[0_8px_18px_rgba(20,184,166,0.6)]
                transition-all duration-200
                disabled:opacity-45 disabled:cursor-not-allowed disabled:drop-shadow-none
              "
            >
              <span>🎲</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGenerate}
              disabled={isGenerating}
              className="
                bg-gradient-to-br from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600
                text-white px-6 py-3 rounded-xl font-bold font-pixel transition-all
                shadow-[4px_4px_0px_rgba(30,58,138,1)] hover:shadow-[2px_2px_0px_rgba(30,58,138,1)] hover:translate-x-[2px] hover:translate-y-[2px]
                flex items-center justify-center gap-2 disabled:opacity-70 disabled:shadow-none disabled:transform-none
              "
            >
              {isGenerating ? <RefreshCw className="animate-spin" size={18} /> : <Lightbulb size={18} />}
              {isGenerating ? 'loading...' : 'REMIX'}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DateIdeaCard;
