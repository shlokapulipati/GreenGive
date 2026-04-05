'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function PrizePoolCalculator() {
  const [subscribers, setSubscribers] = useState(2150);
  const [poolPerSub, setPoolPerSub] = useState(5.5);

  const totalPool = subscribers * poolPerSub;
  const match5 = totalPool * 0.40;
  const match4 = totalPool * 0.35;
  const match3 = totalPool * 0.25;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <section className="py-24 max-w-4xl mx-auto px-6">
      <div className="bg-ink-2 border border-white/5 rounded-[2rem] p-8 md:p-12 relative overflow-hidden shadow-2xl">
        <h2 className="text-3xl font-syne font-bold text-white mb-2 flex items-center gap-3">
          <span>💰</span> Prize Pool Calculator
        </h2>
        <p className="text-gray-400 text-sm mb-12">
          Drag the sliders to see how the pool grows
        </p>

        <div className="text-center mb-16">
          <div className="text-5xl md:text-7xl font-syne font-bold text-gold mb-2">
            {formatCurrency(totalPool)}
          </div>
          <div className="text-gray-400 font-medium text-sm">
            Total prize pool this month
          </div>
        </div>

        <div className="space-y-8 mb-16 max-w-2xl mx-auto">
          {}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Subscribers</span>
              <span className="text-white font-bold">{subscribers.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="100"
              max="10000"
              step="50"
              value={subscribers}
              onChange={(e) => setSubscribers(parseInt(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-gray-400"
            />
          </div>

          {}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Pool per sub (£)</span>
              <span className="text-white font-bold">£{poolPerSub.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="0.5"
              value={poolPerSub}
              onChange={(e) => setPoolPerSub(parseFloat(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-gray-400"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-ink-3 border border-gold/30 rounded-2xl p-6 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gold/5 group-hover:bg-gold/10 transition-colors" />
            <div className="relative z-10">
              <div className="text-xs font-bold text-gold mb-2 uppercase tracking-wider">5-Match 🏆</div>
              <div className="text-2xl font-syne font-bold text-white mb-2">{formatCurrency(match5)}</div>
              <div className="text-xs text-gold">40% • Jackpot</div>
            </div>
          </div>

          <div className="bg-ink-3 border border-white/10 rounded-2xl p-6 text-center">
            <div className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">4-Match</div>
            <div className="text-2xl font-syne font-bold text-white mb-2">{formatCurrency(match4)}</div>
            <div className="text-xs text-gray-500">↓</div>
          </div>

          <div className="bg-ink-3 border border-white/10 rounded-2xl p-6 text-center">
            <div className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">3-Match</div>
            <div className="text-2xl font-syne font-bold text-white mb-2">{formatCurrency(match3)}</div>
            <div className="text-xs text-gray-500">25%</div>
          </div>
        </div>
      </div>
    </section>
  );
}
