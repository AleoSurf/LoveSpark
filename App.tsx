import React, { useState } from 'react';
import Envelope from './components/Envelope';
import ChatBot from './components/ChatBot';
import DateIdeaCard from './components/DateIdeaCard';
import SocialLinks from './components/SocialLinks';
import { AppState } from './types';
import { Heart, Power } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type View = 'home' | 'spark' | 'adviser';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.CLOSED);
  const [currentView, setCurrentView] = useState<View>('spark');
  const [isHeartPopping, setIsHeartPopping] = useState(false);

  const handleOpenEnvelope = () => {
    setAppState(AppState.OPENING);
    setTimeout(() => {
        setAppState(AppState.OPEN);
    }, 500);
  };

  const handleExit = () => {
    setAppState(AppState.CLOSED);
    setCurrentView('spark');
  };

  const triggerHeartPop = () => {
    setIsHeartPopping(true);
    setTimeout(() => setIsHeartPopping(false), 300);
  };

  if (appState === AppState.CLOSED) {
    return <Envelope onOpen={handleOpenEnvelope} />;
  }

  return (
    <div className={`min-h-screen bg-blue-50 y2k-pattern transition-opacity duration-1000 relative overflow-hidden ${appState === AppState.OPEN ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-[10%] text-pink-200 opacity-30 text-6xl hidden lg:block"
        >
          ★
        </motion.div>
        <motion.div 
          animate={{ 
            y: [0, 20, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-40 right-[15%] text-blue-200 opacity-30 text-8xl hidden lg:block"
        >
          ✧
        </motion.div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>
      </div>

      {/* Navbar / Header - Y2K Style */}
      <nav className="p-3 sm:p-4 md:p-6 max-w-6xl mx-auto mb-2 sm:mb-4 relative z-50 safe-area-pb">
        <div className="bg-white/80 backdrop-blur-md rounded-[1.5rem] sm:rounded-[2rem] border-2 sm:border-4 border-blue-100 shadow-[4px_4px_0px_rgba(191,219,254,1)] px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4 transition-all hover:shadow-[2px_2px_0px_rgba(191,219,254,1)] hover:translate-x-[1px] hover:translate-y-[1px]">
          
          {/* Logo Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            <motion.div 
              onClick={triggerHeartPop}
              whileHover={{ scale: 1.2, rotate: 15 }}
              animate={isHeartPopping ? { scale: [1, 1.4, 1] } : {}}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="cursor-pointer"
            >
              <Heart className="text-pink-400 fill-pink-400 w-6 h-6 sm:w-8 sm:h-8 drop-shadow-sm" />
            </motion.div>
            <h1 className="text-xl sm:text-3xl font-pixel text-blue-600 tracking-wider">LoveSpark<span className="text-pink-400">.exe</span></h1>
          </div>

          {/* Navigation Pills */}
          <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto overflow-x-auto sm:overflow-visible pb-1 sm:pb-0">
            <div className="flex items-center bg-blue-50/50 p-1 rounded-full border border-blue-100 min-w-max">
              {[
                { id: 'home', label: 'Home 🏠' },
                { id: 'spark', label: 'Spark ✨' },
                { id: 'adviser', label: 'Adviser 🧸' },
              ].map((item) => (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentView(item.id as View)}
                  className={`px-3 sm:px-6 py-2 rounded-full font-bold text-xs sm:text-sm transition-all duration-300 whitespace-nowrap ${
                    currentView === item.id
                      ? 'bg-white text-blue-500 shadow-md scale-105 border border-blue-100'
                      : 'text-gray-400 hover:text-blue-400'
                  }`}
                >
                  {item.label}
                </motion.button>
              ))}
            </div>

            <SocialLinks />

            {/* Exit Button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleExit}
              className="p-2 sm:p-3 bg-pink-100 text-pink-500 rounded-full border-2 border-pink-200 shadow-sm hover:bg-pink-500 hover:text-white transition-colors flex-shrink-0"
              title="Log Off"
            >
              <Power size={16} sm:size={20} />
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-3 sm:p-4 md:p-6 pb-20 sm:pb-12 relative z-10 safe-area-pb">
        <AnimatePresence mode="wait">
          {currentView === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="flex flex-col items-center gap-6"
            >
              <div className="w-full max-w-2xl text-center">
                 <motion.div 
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="inline-block bg-white border-2 sm:border-4 border-pink-200 rounded-xl sm:rounded-2xl px-6 sm:px-8 py-3 sm:py-4 shadow-[4px_4px_0px_rgba(251,207,232,1)] transform -rotate-1"
                 >
                    <h2 className="text-lg sm:text-2xl font-bold text-gray-700">
                        Welcome to your <span className="text-pink-500 font-pixel">Love Dashboard</span>
                    </h2>
                 </motion.div>
              </div>
              <div className="w-full max-w-4xl flex flex-col lg:flex-row gap-4 lg:gap-6 justify-center items-stretch">
                <div className="flex-1 w-full">
                  <DateIdeaCard />
                </div>
                <div className="flex-1 w-full">
                  <ChatBot />
                </div>
              </div>
            </motion.div>
          )}

          {currentView === 'spark' && (
            <motion.div 
              key="spark"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="w-full max-w-lg mx-auto min-h-[70vh]"
            >
              <DateIdeaCard />
            </motion.div>
          )}

          {currentView === 'adviser' && (
            <motion.div 
              key="adviser"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-5xl mx-auto min-h-[70vh]"
            >
              <ChatBot />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 sm:py-6 text-blue-300 font-pixel text-xs relative z-10 flex flex-col items-center gap-4 px-4">
        <div className="w-70 bg-white/60 backdrop-blur-md rounded-xl border-2 border-pink-100 shadow-lg overflow-hidden">
          <iframe 
            data-testid="embed-iframe"
            style={{ borderRadius: '8px' }} 
            src="https://open.spotify.com/embed/track/5sdQOyqq2IDhvmx2lHOpwd?utm_source=generator" 
            width="100%" 
            height="80" 
            frameBorder="0" 
            allowFullScreen 
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
            loading="lazy"
          ></iframe>
        </div>
        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          Made by Leo🌊 with 🤎 • 2026 before Valentine 💕
        </motion.p>
      </footer>
    </div>
  );
};

export default App;
