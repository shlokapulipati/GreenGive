'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function LiveDrawSimulator() {
  const sampleScores = [18, 24, 31, 9, 36];
  const [hasDrawn, setHasDrawn] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawNumbers, setDrawNumbers] = useState<number[]>([0, 0, 0, 0, 0]);
  const [matchCount, setMatchCount] = useState(0);

  const runDraw = () => {
    setIsDrawing(true);
    setHasDrawn(false);
    
    
    setTimeout(() => {
      
      const newDraw: number[] = [];
      const pool = Array.from({ length: 45 }, (_, i) => i + 1);
      for(let i=0; i<5; i++) {
        const idx = Math.floor(Math.random() * pool.length);
        newDraw.push(pool.splice(idx, 1)[0]);
      }
      newDraw.sort((a,b) => a - b);
      
      const matches = sampleScores.filter(s => newDraw.includes(s)).length;
      
      setDrawNumbers(newDraw);
      setMatchCount(matches);
      setHasDrawn(true);
      setIsDrawing(false);
    }, 600);
  };

  return (
    <section className="py-24 max-w-4xl mx-auto px-6">
      <div className="bg-ink-2 border border-white/5 rounded-[2rem] p-8 md:p-16 relative overflow-hidden text-center shadow-2xl">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[400px] bg-gold/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10">
          <h2 className="text-3xl font-syne font-bold text-white mb-2 flex justify-center items-center gap-3">
            <span>🎱</span> Live Draw Simulator
          </h2>
          <p className="text-gray-400 text-sm mb-12">
            See how the draw engine works — tap to reveal this month's numbers
          </p>

          <div className="mb-10">
            <h3 className="text-xs font-bold tracking-[0.2em] text-gray-500 uppercase mb-4">
              This Month's Draw
            </h3>
            <div className="flex justify-center gap-3 md:gap-4 flex-wrap">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="relative w-16 h-16 md:w-20 md:h-20" style={{ perspective: '1000px' }}>
                  <motion.div
                    className="w-full h-full relative"
                    initial={false}
                    animate={{ rotateY: hasDrawn ? 180 : 0 }}
                    transition={{ duration: 0.6, type: 'spring', bounce: 0.4, delay: i * 0.1 }}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {}
                    <div 
                      className="absolute inset-0 w-full h-full rounded-full bg-ink-3 border border-white/10 flex items-center justify-center font-syne font-bold text-2xl md:text-3xl text-gray-500"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      ?
                    </div>
                    {}
                    <div 
                      className="absolute inset-0 w-full h-full rounded-full bg-gradient-to-br from-gold-light via-gold to-gold-dark flex items-center justify-center font-syne font-bold text-2xl md:text-3xl text-ink shadow-[0_0_20px_rgba(201,168,76,0.3)]"
                      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                      {drawNumbers[i]}
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center -mt-3 mb-2 relative z-20">
              <div className="w-8 h-8 rounded-full bg-ink-3 border border-white/10 flex items-center justify-center text-gray-400 shadow-xl">
                ↓
              </div>
            </div>
          </div>

          <div className="mb-10 mt-6">
            <h3 className="text-xs font-bold tracking-[0.2em] text-gray-500 uppercase mb-4">
              Your Sample Scores
            </h3>
            <div className="flex justify-center gap-3 flex-wrap">
              {sampleScores.map((num, i) => {
                const isMatch = hasDrawn && drawNumbers.includes(num);
                return (
                  <motion.div
                    key={i}
                    animate={{ scale: isMatch ? 1.1 : 1, y: isMatch ? -5 : 0 }}
                    className={`w-12 h-12 md:w-14 md:h-14 rounded-full border flex items-center justify-center font-syne text-lg md:text-xl transition-colors duration-500 ${
                      isMatch 
                      ? 'bg-gold border-gold text-ink font-bold shadow-[0_0_15px_rgba(201,168,76,0.5)]' 
                      : 'bg-ink-3 border-white/5 text-gray-400'
                    }`}
                  >
                    {num}
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="h-16 mb-8 flex items-center justify-center">
            {hasDrawn && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={`border rounded-xl p-4 font-medium max-w-md mx-auto shadow-lg w-full ${
                  matchCount >= 3 
                  ? 'bg-gold/10 border-gold/50 text-gold-light'
                  : 'bg-[#003831] border-[#00c9a7]/30 text-[#00c9a7]'
                }`}
              >
                {matchCount === 5 ? 'Jackpot! 🏆 You matched all 5!' :
                 matchCount === 4 ? `Awesome! 🎉 You matched 4 numbers!` :
                 matchCount === 3 ? `Nice! 👏 You matched 3 numbers!` :
                 `😢 No match this time — better luck next month!`
                }
              </motion.div>
            )}
          </div>

          <button 
            onClick={runDraw}
            disabled={isDrawing}
            className="px-6 py-2 rounded-full border border-white/10 text-white font-medium hover:bg-white/5 transition-colors relative z-10 disabled:opacity-50"
          >
            {hasDrawn ? 'Draw Again' : isDrawing ? 'Drawing...' : 'Run Draw'}
          </button>
          
          <div className="flex justify-center mt-6">
             <div className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white transition-colors cursor-pointer">
                ↓
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
