'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/src/supabase/client';
import Navbar from '@/src/components/layout/Navbar';
import { Trophy, Calendar, Users, ArrowUpRight, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function DrawsPage() {
  const [draws, setDraws] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscriptionActive, setSubscriptionActive] = useState(false);

  useEffect(() => {
    fetchDraws();
  }, []);

  const fetchDraws = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('subscription_status').eq('id', user.id).single();
      setSubscriptionActive(profile?.subscription_status === 'active');
    }

    const { data } = await supabase.from('draws')
      .select('*, prizes(*)')
      .eq('status', 'published')
      .order('month', { ascending: false });
    
    setDraws(data || []);
    setLoading(false);
  };

  const currentJackpot = draws[0]?.jackpot_amount || 2500;

  return (
    <main className="min-h-screen bg-ink text-white pt-24 pb-20">
      <Navbar />

      {}
      <section className="relative py-20 px-6 border-b border-white/5 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gold/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
               <span className="text-xs font-bold text-gold uppercase tracking-[0.3em] mb-4 block">Next Monthly Draw</span>
               <h1 className="text-6xl md:text-8xl font-syne font-black mb-8 leading-tight">
                 Current <br /><span className="text-gold italic">Jackpot</span>
               </h1>
               <div className="flex items-center gap-4 mb-12">
                  <div className="text-7xl md:text-9xl font-black font-syne text-white tracking-tighter transition-all">£{currentJackpot.toLocaleString()}</div>
                  <div className="px-4 py-2 bg-teal-brand/10 border border-teal-brand/20 rounded-2xl text-teal-brand text-xs font-bold uppercase tracking-widest animate-pulse">Live Pool</div>
               </div>
               
               {!subscriptionActive ? (
                 <div className="p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md max-w-md">
                    <p className="text-gray-400 text-sm mb-6 flex items-start gap-3">
                       <AlertCircle size={18} className="text-gold shrink-0 mt-0.5" />
                       You must be an active subscriber with 5 scores entered to qualify for the next draw.
                    </p>
                    <Link href="/auth/signup" className="w-full py-4 bg-gold text-ink font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-gold-light transition-all shadow-2xl">
                       Enter Monthly Draw <ArrowUpRight size={18} />
                    </Link>
                 </div>
               ) : (
                 <div className="p-6 bg-teal-brand/10 border border-teal-brand/20 rounded-3xl flex items-center gap-4 max-w-sm">
                    <CheckCircle2 size={24} className="text-teal-brand" />
                    <div>
                       <p className="text-sm font-bold text-white">Subscription Active</p>
                       <p className="text-[10px] text-teal-brand uppercase font-black">You are in the next draw</p>
                    </div>
                 </div>
               )}
            </motion.div>

            {}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="bg-ink-2 border border-white/5 rounded-[40px] p-10 md:p-16 shadow-3xl relative">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Info size={120} />
               </div>
               <h2 className="text-2xl font-syne font-black mb-8">Prize Tier Logic</h2>
               <div className="space-y-6">
                  <PrizeTier tier={5} label="5-Number Match" pct={40} desc="The ultimate jackpot. Rolls over if unclaimed." rollover />
                  <PrizeTier tier={4} label="4-Number Match" pct={35} desc="Shared equally among winners." />
                  <PrizeTier tier={3} label="3-Number Match" pct={25} desc="Shared equally among winners." />
               </div>
               <p className="mt-8 text-xs text-gray-500 italic leading-relaxed">
                  * Prize pools are calculated based on the total number of active subscribers each month. 40% of the total monthly contribution funds these pools.
               </p>
            </motion.div>

          </div>
        </div>
      </section>

      {}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-syne font-black text-white mb-12">Draw History</h2>
        
        {loading ? (
          <div className="flex justify-center py-20">
             <div className="w-8 h-8 border-t-2 border-gold rounded-full animate-spin" />
          </div>
        ) : draws.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl text-gray-600">
             No draws have been published yet. Check back soon!
          </div>
        ) : (
          <div className="space-y-6">
             {draws.map(d => (
               <motion.div key={d.id} whileHover={{ x: 10 }} className="bg-ink-2 border border-white/5 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 group hover:border-gold/30 transition-all shadow-xl">
                  <div className="flex flex-col items-center md:items-start min-w-[120px]">
                     <span className="text-[10px] font-bold text-gray-500 uppercase mb-1 tracking-widest">Draw Month</span>
                     <span className="text-3xl font-syne font-black text-white">{d.month}</span>
                  </div>
                  
                  <div className="flex-1 flex flex-wrap justify-center md:justify-start gap-4">
                     {d.numbers.map((n: number) => (
                       <div key={n} className="w-14 h-14 bg-ink/50 border border-white/10 rounded-2xl flex items-center justify-center text-2xl font-syne font-black text-gold shadow-lg group-hover:scale-110 transition-transform">
                          {n}
                       </div>
                     ))}
                  </div>

                  <div className="grid grid-cols-3 gap-6 md:gap-12 min-w-[300px]">
                     <div className="text-center md:text-left">
                        <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Total Pool</p>
                        <p className="font-bold">£{d.total_pool.toLocaleString()}</p>
                     </div>
                     <div className="text-center md:text-left">
                        <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Subscribers</p>
                        <p className="font-bold italic">{d.active_subscriber_count}</p>
                     </div>
                     <div className="text-center md:text-left">
                        <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Status</p>
                        <p className="text-teal-brand font-bold uppercase text-[10px]">Settled</p>
                     </div>
                  </div>
               </motion.div>
             ))}
          </div>
        )}
      </section>

    </main>
  );
}

function PrizeTier({ tier, label, pct, desc, rollover }: { tier: number, label: string, pct: number, desc: string, rollover?: boolean }) {
  return (
    <div className="p-6 bg-ink-3 border border-white/5 rounded-2xl hover:border-white/10 transition-colors group">
       <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-3">
             <span className="w-6 h-6 rounded bg-gold/10 text-gold flex items-center justify-center text-[10px] font-bold">{tier}</span>
             <span className="font-syne font-bold text-lg group-hover:text-gold transition-colors">{label}</span>
          </div>
          <div className="text-xl font-black text-white">{pct}%</div>
       </div>
       <p className="text-xs text-gray-500 mb-2">{desc}</p>
       {rollover && (
          <div className="inline-flex items-center gap-2 text-[10px] font-bold text-gold uppercase px-2 py-0.5 bg-gold/10 rounded">
             <ArrowUpRight size={10} /> Jackpot Rollover Enabled
          </div>
       )}
    </div>
  );
}
