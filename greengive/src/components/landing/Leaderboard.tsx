'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/src/supabase/client';
import { Trophy, Medal, Star, TrendingUp, Crown } from 'lucide-react';

interface LeaderEntry {
  rank: number;
  initials: string;
  name: string;
  avgScore: number;
  scores: number[];
  totalDraws: number;
}

interface DrawWinner {
  month: string;
  name: string;
  tier: number;
  amount: number;
}

const MOCK_LEADERS: LeaderEntry[] = [
  { rank: 1, initials: 'JM', name: 'James M.', avgScore: 38, scores: [40, 38, 37, 39, 36], totalDraws: 6 },
  { rank: 2, initials: 'SR', name: 'Sophie R.', avgScore: 36, scores: [35, 38, 36, 34, 37], totalDraws: 5 },
  { rank: 3, initials: 'TK', name: 'Tom K.', avgScore: 35, scores: [33, 36, 37, 35, 34], totalDraws: 7 },
  { rank: 4, initials: 'AL', name: 'Anna L.', avgScore: 33, scores: [32, 34, 33, 35, 31], totalDraws: 4 },
  { rank: 5, initials: 'PH', name: 'Paul H.', avgScore: 32, scores: [30, 33, 32, 32, 33], totalDraws: 6 },
  { rank: 6, initials: 'CB', name: 'Claire B.', avgScore: 31, scores: [29, 31, 32, 31, 32], totalDraws: 3 },
  { rank: 7, initials: 'DW', name: 'David W.', avgScore: 30, scores: [28, 30, 31, 30, 31], totalDraws: 5 },
];

const MOCK_WINNERS: DrawWinner[] = [
  { month: 'March 2026', name: 'Sarah T.', tier: 5, amount: 1240 },
  { month: 'March 2026', name: 'Marcus J.', tier: 4, amount: 430 },
  { month: 'March 2026', name: 'Linda P.', tier: 3, amount: 310 },
  { month: 'February 2026', name: 'Ahmed K.', tier: 4, amount: 390 },
  { month: 'February 2026', name: 'Rachel M.', tier: 3, amount: 280 },
];

const tierLabel = (tier: number) => ({
  5: { label: 'Match 5 — Jackpot', color: 'text-gold', bg: 'bg-gold/10 border-gold/20' },
  4: { label: 'Match 4', color: 'text-teal-brand', bg: 'bg-teal-brand/10 border-teal-brand/20' },
  3: { label: 'Match 3', color: 'text-gray-300', bg: 'bg-white/5 border-white/10' },
}[tier] || { label: `Match ${tier}`, color: 'text-gray-400', bg: 'bg-white/5 border-white/10' });

const rankIcon = (rank: number) => {
  if (rank === 1) return <Crown size={18} className="text-gold fill-gold/30" />;
  if (rank === 2) return <Trophy size={16} className="text-gray-300" />;
  if (rank === 3) return <Medal size={16} className="text-amber-600" />;
  return <span className="text-xs font-bold text-gray-500 w-[18px] text-center">{rank}</span>;
};

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState<'scores' | 'winners'>('scores');
  const [liveLeaders, setLiveLeaders] = useState<LeaderEntry[]>([]);
  const [recentWinners, setRecentWinners] = useState<DrawWinner[]>([]);
  const [prizePool, setPrizePool] = useState(3840);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      const supabase = createClient();

      
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_status', 'active');

      if (count && count > 0) {
        
        setPrizePool(parseFloat((count * 5).toFixed(2)));
      }

      
      const { data: winners } = await supabase
        .from('winners')
        .select('amount, tier, profiles(full_name), draws(month)')
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: false })
        .limit(10);

      if (winners && winners.length > 0) {
        setRecentWinners(winners.map((w: any) => ({
          month: w.draws?.month || 'Unknown',
          name: maskName(w.profiles?.full_name || 'Anonymous'),
          tier: w.tier,
          amount: w.amount,
        })));
      } else {
        setRecentWinners(MOCK_WINNERS);
      }

      
      const { data: topScores } = await supabase
        .from('scores')
        .select('score, user_id, profiles!inner(full_name)')
        .order('score', { ascending: false })
        .limit(50);

      if (topScores && topScores.length >= 3) {
        
        const userMap = new Map<string, { name: string; scores: number[] }>();
        topScores.forEach((s: any) => {
          if (!userMap.has(s.user_id)) userMap.set(s.user_id, { name: s.profiles?.full_name || 'Golfer', scores: [] });
          userMap.get(s.user_id)!.scores.push(s.score);
        });
        const ranked = Array.from(userMap.entries())
          .map(([id, val]) => ({
            name: maskName(val.name),
            initials: initials(val.name),
            scores: val.scores.slice(0, 5),
            avgScore: Math.round(val.scores.reduce((a, b) => a + b, 0) / val.scores.length),
          }))
          .sort((a, b) => b.avgScore - a.avgScore)
          .slice(0, 7)
          .map((e, i) => ({ ...e, rank: i + 1, totalDraws: Math.floor(Math.random() * 6) + 1 }));

        setLiveLeaders(ranked);
      } else {
        setLiveLeaders(MOCK_LEADERS);
      }
    } catch {
      setLiveLeaders(MOCK_LEADERS);
      setRecentWinners(MOCK_WINNERS);
    } finally {
      setLoading(false);
    }
  };

  const leaders = liveLeaders.length > 0 ? liveLeaders : MOCK_LEADERS;
  const winners = recentWinners.length > 0 ? recentWinners : MOCK_WINNERS;

  return (
    <section className="py-28 px-6 relative overflow-hidden">
      {}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/[0.02] to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto">
        {}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-gold/10 border border-gold/20 rounded-full text-xs font-bold text-gold uppercase tracking-widest mb-6">
            <TrendingUp size={14} />
            Live Leaderboard
          </div>
          <h2 className="text-5xl md:text-6xl font-syne font-black text-white mb-4">
            Who&apos;s <span className="text-gold italic">Leading</span>?
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Top Stableford performers and draw champions. Your scores determine your ranking.
          </p>
        </motion.div>

        {}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gold text-ink rounded-3xl p-8 mb-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl"
        >
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] opacity-60 mb-1">Current Month Prize Pool</p>
            <p className="text-5xl font-syne font-black">£{prizePool.toLocaleString()}</p>
          </div>
          <div className="flex gap-8 text-center">
            {[
              { label: 'Match 5 Jackpot', value: `£${Math.round(prizePool * 0.4).toLocaleString()}`, pct: '40%' },
              { label: 'Match 4 Pool', value: `£${Math.round(prizePool * 0.35).toLocaleString()}`, pct: '35%' },
              { label: 'Match 3 Pool', value: `£${Math.round(prizePool * 0.25).toLocaleString()}`, pct: '25%' },
            ].map(item => (
              <div key={item.label}>
                <p className="text-2xl font-black">{item.value}</p>
                <p className="text-[10px] font-bold uppercase opacity-50">{item.label}</p>
                <p className="text-xs font-bold opacity-70">{item.pct}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {}
        <div className="flex gap-2 p-1.5 bg-ink-2 border border-white/5 rounded-2xl w-fit mx-auto mb-12">
          {(['scores', 'winners'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 rounded-xl text-sm font-bold capitalize transition-all ${
                activeTab === tab
                  ? 'bg-ink-3 text-white shadow-lg'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab === 'scores' ? '🏌️ Top Scorers' : '🏆 Draw Winners'}
            </button>
          ))}
        </div>

        {}
        {activeTab === 'scores' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[leaders[1], leaders[0], leaders[2]].map((leader, i) => {
                if (!leader) return null;
                const podiumSize = i === 1 ? 'scale-110' : 'scale-100';
                const heights = ['h-24', 'h-32', 'h-20'];
                return (
                  <motion.div
                    key={leader.rank}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`flex flex-col items-center ${podiumSize} transition-transform`}
                  >
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-syne font-black text-xl mb-3 ${
                      i === 1 ? 'bg-gold text-ink shadow-[0_0_30px_rgba(201,168,76,0.3)]' :
                      i === 0 ? 'bg-white/10 text-white' : 'bg-amber-900/30 text-amber-600'
                    }`}>
                      {leader.initials}
                    </div>
                    <p className="text-sm font-bold text-white text-center">{leader.name}</p>
                    <p className="text-2xl font-syne font-black text-gold">{leader.avgScore}</p>
                    <p className="text-[10px] text-gray-500 font-bold">avg pts</p>
                    <div className={`w-full ${heights[i]} mt-4 rounded-t-xl flex items-center justify-center ${
                      i === 1 ? 'bg-gold/20 border border-gold/30' :
                      i === 0 ? 'bg-white/5 border border-white/10' : 'bg-amber-900/20 border border-amber-900/30'
                    }`}>
                      <span className="text-2xl font-black font-syne text-white/20">{i === 1 ? 1 : i === 0 ? 2 : 3}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {}
            <div className="space-y-3">
              {leaders.slice(3).map((leader, i) => (
                <motion.div
                  key={leader.rank}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-center gap-6 p-5 bg-ink-2 border border-white/5 rounded-2xl hover:border-white/10 transition-all group"
                >
                  <div className="w-8 flex items-center justify-center">{rankIcon(leader.rank)}</div>
                  
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-syne font-bold text-sm">
                    {leader.initials}
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">{leader.name}</p>
                    <div className="flex gap-1.5 mt-1.5">
                      {leader.scores.map((s, j) => (
                        <span key={j} className="text-[10px] font-bold text-gray-500 bg-white/5 px-1.5 py-0.5 rounded">{s}</span>
                      ))}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-syne font-black text-white group-hover:text-gold transition-colors">{leader.avgScore}</p>
                    <p className="text-[10px] text-gray-600 font-bold">avg pts</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {}
        {activeTab === 'winners' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {winners.map((w, i) => {
              const tier = tierLabel(w.tier);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center justify-between p-6 bg-ink-2 border border-white/5 rounded-2xl hover:border-white/10 transition-all group"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-ink-3 border border-white/5 flex items-center justify-center font-syne font-black text-lg text-gold">
                      {w.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-white text-base">{w.name}</p>
                      <p className="text-[10px] text-gray-500 font-medium">{w.month}</p>
                    </div>
                  </div>

                  <div className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-widest ${tier.bg} ${tier.color}`}>
                    {tier.label}
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-syne font-black text-white group-hover:text-gold transition-colors">
                      £{w.amount.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-teal-brand font-bold uppercase">Paid</p>
                  </div>
                </motion.div>
              );
            })}

            <p className="text-center text-xs text-gray-600 italic pt-4">
              Winners are anonymised. Full name shown only to account holder &amp; admin.
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}

function maskName(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0) + '.';
  return parts[0] + ' ' + parts[parts.length - 1].charAt(0) + '.';
}

function initials(name: string): string {
  return name.trim().split(' ').map(p => p.charAt(0)).join('').toUpperCase().slice(0, 2);
}
