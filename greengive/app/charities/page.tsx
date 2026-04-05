'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/src/supabase/client';
import Navbar from '@/src/components/layout/Navbar';
import { Search, Heart, ExternalLink, ArrowRight, Filter, Users, Target } from 'lucide-react';
import Link from 'next/link';

const MOCK_CHARITIES = [
  { id: 'mock-1', name: 'Green Links Foundation', description: 'Providing youth access to professional golf coaching and equipment.', image_url: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&q=80', raised_amount: 12500, goal_amount: 50000, featured: true },
  { id: 'mock-2', name: 'Fairway to Heaven', description: 'Supporting mental health initiatives through outdoor sports and community golfing.', image_url: 'https://images.unsplash.com/photo-1592919505780-303950717480?w=800&q=80', raised_amount: 8400, goal_amount: 20000 },
  { id: 'mock-3', name: 'Birdies for Beds', description: 'Combating local homelessness with every birdie scored by our members.', image_url: 'https://images.unsplash.com/photo-1535498730771-e735b998cd64?w=800&q=80', raised_amount: 32000, goal_amount: 40000 }
];


export default function CharitiesPage() {
  const [charities, setCharities] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCharity, setSelectedCharity] = useState<any>(null);

  useEffect(() => {
    fetchCharities();
  }, []);

  const fetchCharities = async () => {
    const supabase = createClient();
    try {
      const { data } = await supabase.from('charities').select('*').eq('active', true);
      setCharities(data && data.length > 0 ? data : MOCK_CHARITIES);
    } catch {
      setCharities(MOCK_CHARITIES);
    }
    setLoading(false);
  };

  const filteredCharities = charities.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-ink text-white pt-24 pb-20">
      <Navbar />
      
      {}
      <section className="relative py-20 px-6 overflow-hidden border-b border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-b from-teal-brand/5 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-7xl font-syne font-black mb-6">
            Make <span className="text-gold italic">Impact</span> Real
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
            Every subscription contributes 10% directly to your chosen charity. Explore the causes our community supports.
          </motion.p>
          
          <div className="max-w-2xl mx-auto relative group">
            <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name, cause, or keywords..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl pl-16 pr-6 text-lg focus:outline-none focus:border-gold/30 transition-all backdrop-blur-sm"
            />
          </div>
        </div>
      </section>

      {}
      <section className="max-w-7xl mx-auto px-6 py-20">
        {loading ? (
          <div className="flex justify-center py-20">
             <div className="w-8 h-8 border-t-2 border-gold rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredCharities.map((charity, i) => (
                <motion.div 
                  key={charity.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-ink-2 border border-white/5 rounded-3xl overflow-hidden group hover:border-gold/30 transition-all flex flex-col shadow-2xl"
                >
                  <div className="h-48 relative overflow-hidden bg-white/5">
                    {charity.image_url ? (
                       <img src={charity.image_url} alt={charity.name} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 scale-105 group-hover:scale-100" />
                    ) : (
                       <div className="w-full h-full flex items-center justify-center text-gray-800">
                          <Heart size={64} fill="currentColor" />
                       </div>
                    )}
                    {charity.featured && (
                       <div className="absolute top-4 right-4 bg-gold text-ink text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-xl">
                          Featured
                       </div>
                    )}
                  </div>

                  <div className="p-8 flex flex-col flex-1">
                    <h3 className="text-2xl font-syne font-bold mb-3 text-white group-hover:text-gold transition-colors">{charity.name}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-8 flex-1 line-clamp-3 italic">
                      &quot;{charity.description}&quot;
                    </p>

                    <div className="space-y-4 mb-8">
                       <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                          <span className="text-gray-500">Raised so far</span>
                          <span className="text-teal-brand">£{charity.raised_amount.toLocaleString()}</span>
                       </div>
                       <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((charity.raised_amount / charity.goal_amount) * 100, 100)}%` }}
                            className="h-full bg-teal-brand shadow-[0_0_10px_rgba(20,184,166,0.3)]"
                          />
                       </div>
                    </div>

                    <div className="flex items-center justify-between">
                       <Link href="/auth/signup" className="text-xs font-bold text-white flex items-center gap-2 hover:gap-3 transition-all group-hover:text-gold">
                          Support this cause <ArrowRight size={14} />
                       </Link>
                       <button onClick={() => setSelectedCharity(charity)} className="text-xs font-bold text-gray-500 hover:text-white transition-colors">
                          Learn more
                       </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {}
      <AnimatePresence>
        {selectedCharity && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedCharity(null)} className="fixed inset-0 bg-ink/90 backdrop-blur-md z-[100]" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 m-auto w-full max-w-4xl h-fit max-h-[90vh] bg-ink-2 border border-white/10 rounded-[40px] z-[101] overflow-hidden flex flex-col shadow-3xl">
               <button onClick={() => setSelectedCharity(null)} className="absolute top-8 right-8 z-20 w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white transition-all uppercase text-[10px] font-bold">Close</button>
               
               <div className="grid md:grid-cols-2">
                  <div className="h-64 md:h-auto overflow-hidden bg-white/5 border-r border-white/5">
                     <img src={selectedCharity.image_url} alt={selectedCharity.name} className="w-full h-full object-cover opacity-80" />
                  </div>
                  <div className="p-10 md:p-16 space-y-8 overflow-y-auto max-h-[80vh]">
                     <div>
                        <span className="text-xs font-bold text-gold uppercase tracking-[0.3em] mb-4 block">Charity Profile</span>
                        <h2 className="text-4xl font-syne font-black mb-4">{selectedCharity.name}</h2>
                        <p className="text-gray-400 leading-relaxed text-sm italic">&quot;{selectedCharity.description}&quot;</p>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-ink border border-white/5 rounded-2xl">
                           <Users size={20} className="text-teal-brand mb-3" />
                           <p className="text-[10px] font-black text-gray-500 uppercase mb-1">Subscribers</p>
                           <p className="text-xl font-bold">1.2k</p>
                        </div>
                        <div className="p-6 bg-ink border border-white/5 rounded-2xl">
                           <Target size={20} className="text-gold mb-3" />
                           <p className="text-[10px] font-black text-gray-500 uppercase mb-1">Impact Goal</p>
                           <p className="text-xl font-bold">£{selectedCharity.goal_amount.toLocaleString()}</p>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <h4 className="text-xs font-bold text-gray-200 uppercase tracking-widest">Impact Progress</h4>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                           <div className="h-full bg-teal-brand" style={{ width: `${(selectedCharity.raised_amount / selectedCharity.goal_amount) * 100}%` }} />
                        </div>
                        <div className="flex justify-between text-sm">
                           <span className="text-gray-500">Raised: £{selectedCharity.raised_amount.toLocaleString()}</span>
                           <span className="text-gold font-bold">{Math.round((selectedCharity.raised_amount / selectedCharity.goal_amount) * 100)}%</span>
                        </div>
                     </div>

                     <Link href="/auth/signup" className="w-full py-4 bg-white text-ink font-black rounded-2xl text-center shadow-2xl hover:bg-gray-100 transition-all flex items-center justify-center gap-3">
                        Support with my Membership <ArrowRight size={18} />
                     </Link>
                  </div>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </main>
  );
}
