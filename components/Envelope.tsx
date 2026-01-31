import React, { useState } from 'react';

interface EnvelopeProps {
  onOpen: () => void;
}

const Envelope: React.FC<EnvelopeProps> = ({ onOpen }) => {
  const [isOpening, setIsOpening] = useState(false);

  const handleClick = () => {
    if (isOpening) return;
    setIsOpening(true);
    setTimeout(() => {
      onOpen();
    }, 1000); // Wait for animation
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#e0f2fe] overflow-hidden relative font-pixel">
      {/* Y2K/NewJeans Style Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Pixel Stars and Hearts */}
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              color: ['#f472b6', '#60a5fa', '#c084fc', '#4ade80'][Math.floor(Math.random() * 4)],
              fontSize: `${Math.random() * 1.5 + 0.5}rem`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: 0.7
            }}
          >
            {['✧', '★', '❤', '✿', 'grid'][Math.floor(Math.random() * 5)] === 'grid' ? (
              <div className="w-4 h-4 border border-current opacity-20" />
            ) : (
              ['✧', '★', '❤', '✿'][Math.floor(Math.random() * 4)]
            )}
          </div>
        ))}
        {/* Floating Bunny/Y2K shapes */}
        <div className="absolute top-10 left-10 text-blue-400 opacity-20 text-8xl rotate-12">🐰</div>
        <div className="absolute bottom-20 right-10 text-pink-400 opacity-20 text-9xl -rotate-12">✨</div>
        <div className="absolute top-1/4 right-1/4 text-purple-400 opacity-10 text-6xl">💿</div>
      </div>

      <div className="z-10 text-center mb-12">
        <h1 className="text-7xl sm:text-8xl text-blue-500 mb-6 drop-shadow-sm tracking-widest">
          LoveSpark
        </h1>
        <p className="text-pink-400 text-3xl sm:text-4xl font-bold drop-shadow-[0_0_10px_rgba(236,72,153,0.5)] tracking-widest animate-pulse">
          ✧ Click to start your romance ✧
        </p>
      </div>

      <div 
        className={`relative w-96 h-64 bg-[#60a5fa] border-4 border-white shadow-[8px_8px_0px_rgba(96,165,250,0.3)] cursor-pointer transition-all duration-1000 transform ${isOpening ? 'scale-110 translate-y-20 opacity-0' : 'hover:scale-105 hover:-rotate-1'}`}
        onClick={handleClick}
      >
        {/* Envelope Flap */}
        <div 
          className={`absolute top-0 left-0 w-0 h-0 border-l-[192px] border-r-[192px] border-t-[130px] border-l-transparent border-r-transparent border-t-[#3b82f6] origin-top transition-all duration-1000 z-20 ${isOpening ? 'rotate-x-180 -translate-y-full opacity-0' : ''}`}
        ></div>
        
        {/* Envelope Body (Bottom Triangle simulation for pocket look) */}
        <div className="absolute bottom-0 left-0 w-0 h-0 border-l-[192px] border-r-[192px] border-b-[120px] border-l-transparent border-r-transparent border-b-[#93c5fd] z-10"></div>
        
        {/* Letter Inside (Hidden initially, slides up on open) */}
        <div className={`absolute left-6 right-6 top-6 bottom-6 bg-white border-2 border-pink-100 shadow-md flex items-center justify-center transition-all duration-1000 z-0 ${isOpening ? '-translate-y-40' : ''}`}>
           <span className="text-3xl text-pink-500">For You 💌</span>
        </div>

        {/* Seal */}
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-pink-400 rounded-full border-4 border-pink-200 shadow-lg z-30 flex items-center justify-center text-white text-3xl transition-opacity duration-500 ${isOpening ? 'opacity-0' : ''}`}>
          ❤
        </div>
      </div>
      
      <p className="mt-16 text-blue-400 animate-bounce cursor-pointer font-bold text-xl bg-white px-6 py-3 rounded-xl border-2 border-blue-100 shadow-sm hover:shadow-md transition-all" onClick={handleClick}>
        {isOpening ? "Loading..." : "Tap to Open"}
      </p>
    </div>
  );
};

export default Envelope;
