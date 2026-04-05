'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/src/supabase/client';
import { simulateDraw, publishDraw } from '@/src/lib/api';
import Navbar from '@/src/components/layout/Navbar';
import { Settings, Users, Trophy, Heart, BarChart3, Search, Play, FileCheck, CheckCircle2, XCircle, AlertTriangle, Eye } from 'lucide-react';

type Tab = 'users' | 'draws' | 'winners' | 'charities' | 'analytics';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('draws');
  const [users, setUsers] = useState<any[]>([]);
  const [draws, setDraws] = useState<any[]>([]);
  const [winners, setWinners] = useState<any[]>([]);
  const [charities, setCharities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  
  const [logic, setLogic] = useState('random');
  const [simulation, setSimulation] = useState<any>(null);
  const [simLoading, setSimLoading] = useState(false);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return window.location.href = '/auth/login';

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return window.location.href = '/dashboard';

    setIsAdmin(true);
    fetchData();
  };

  const fetchData = async () => {
    setLoading(true);
    const supabase = createClient();
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;
      if (!token) return;

      
      const [uRes, dRes, wRes, cRes] = await Promise.all([
        supabase.from('profiles').select('*, scores(count)').order('created_at', { ascending: false }),
        supabase.from('draws').select('*').order('month', { ascending: false }),
        supabase.from('winners').select('*, profiles(full_name, email), draws(month)').order('created_at', { ascending: false }),
        supabase.from('charities').select('*').order('name'),
      ]);

      setUsers(uRes.data || []);
      setDraws(dRes.data || []);
      setWinners(wRes.data || []);
      setCharities(cRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulate = async () => {
    setSimLoading(true);
    try {
      const supabase = createClient();
      const { data: session } = await supabase.auth.getSession();
      const res = await simulateDraw('April 2026', logic, session.session?.access_token!);
      setSimulation(res);
    } catch (err) {
      console.error(err);
    } finally {
      setSimLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!simulation) return;
    try {
      const supabase = createClient();
      const { data: session } = await supabase.auth.getSession();
      await publishDraw({
        month: 'April 2026',
        logic: logic,
        drawNumbers: simulation.simulation.drawNumbers,
        winners: simulation.simulation.winners,
        poolTotals: simulation.pool
      }, session.session?.access_token!);
      setSimulation(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAdmin || loading) return (
    <div className="min-h-screen bg-ink flex items-center justify-center">
      <div className="w-8 h-8 border-t-2 border-gold rounded-full animate-spin" />
    </div>
  );

  return (
    <main className="min-h-screen bg-ink text-white pt-24 pb-12">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <header>
            <h1 className="text-4xl font-syne font-black mb-2 flex items-center gap-4">
               Admin Console <span className="text-xs font-bold bg-gold/10 text-gold border border-gold/20 px-3 py-1 rounded-full uppercase tracking-widest">Internal Use</span>
            </h1>
            <p className="text-gray-400">Configure draws, verify winners, and manage platform health.</p>
          </header>

          <aside className="flex gap-2 p-1 bg-ink-2 border border-white/5 rounded-xl">
             <TabButton icon={<Trophy size={16}/>} label="Draws" active={activeTab === 'draws'} onClick={() => setActiveTab('draws')} />
             <TabButton icon={<Users size={16}/>} label="Users" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
             <TabButton icon={<FileCheck size={16}/>} label="Verification" active={activeTab === 'winners'} onClick={() => setActiveTab('winners')} />
             <TabButton icon={<Heart size={16}/>} label="Charities" active={activeTab === 'charities'} onClick={() => setActiveTab('charities')} />
          </aside>
        </div>

        <section className="min-h-[600px] bg-ink-2 border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
          <AnimatePresence mode="wait">
            
            {}
            {activeTab === 'draws' && (
              <motion.div key="draws" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-8">
                <div className="grid lg:grid-cols-2 gap-12">
                  
                  {}
                  <div className="space-y-8">
                    <h2 className="text-2xl font-syne font-black text-white mb-6">Run Monthly Draw</h2>
                    
                    <div className="p-8 bg-ink-3/50 border border-white/5 rounded-2xl space-y-6">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Select Draw Algorithm (Requirement 06)</label>
                        <div className="grid grid-cols-1 gap-3">
                           <LogicOption id="random" label="Pure Random Draw" desc="Standard 5/45 lottery logic." active={logic === 'random'} onClick={setLogic} />
                           <LogicOption id="weighted_frequent" label="Weighted (Frequent)" desc="Bias toward most common user scores." active={logic === 'weighted_frequent'} onClick={setLogic} />
                           <LogicOption id="weighted_rare" label="Weighted (Rare)" desc="Bias toward numbers NOT in user scores." active={logic === 'weighted_rare'} onClick={setLogic} />
                        </div>
                      </div>

                      <button 
                        onClick={handleSimulate}
                        disabled={simLoading}
                        className="w-full py-4 bg-gold text-ink font-bold rounded-xl hover:bg-gold-light transition-all flex items-center justify-center gap-3 shadow-xl"
                      >
                         {simLoading ? 'Analysing...' : <><Play size={18} fill="currentColor" /> Run Simulation</>}
                      </button>
                    </div>

                    <div className="space-y-4">
                       <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-2">Draw History</h3>
                       {draws.slice(0, 3).map(d => (
                         <div key={d.id} className="flex items-center justify-between p-4 bg-ink-3/30 border border-white/5 rounded-xl">
                            <span className="font-syne font-bold">{d.month}</span>
                            <div className="flex gap-2">
                               {d.numbers.map((n: number) => <span key={n} className="w-7 h-7 rounded-md bg-white/5 flex items-center justify-center text-xs font-bold text-gold">{n}</span>)}
                            </div>
                            <span className="text-[10px] text-teal-brand font-bold uppercase">{d.status}</span>
                         </div>
                       ))}
                    </div>
                  </div>

                  {}
                  <div>
                    <h2 className="text-2xl font-syne font-black text-white mb-6">Simulation Preview</h2>
                    {!simulation ? (
                       <div className="h-[450px] border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-center p-12">
                          <Trophy size={48} className="text-gray-700 mb-6" />
                          <p className="text-gray-500 text-sm italic">Configure logic and run simulation to preview payouts and winners before publishing.</p>
                       </div>
                    ) : (
                       <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                          <div className="p-8 bg-gold border border-gold rounded-2xl text-ink">
                             <div className="flex justify-between items-start mb-6">
                                <span className="text-xs font-black uppercase tracking-widest">Draw Result Preview</span>
                                <span className="px-2 py-1 bg-ink/10 rounded text-[10px] font-bold">April 2026</span>
                             </div>
                             <div className="flex justify-between gap-2 mb-8">
                                {simulation.simulation.drawNumbers.map((n: number) => <div key={n} className="w-12 h-12 bg-ink rounded-xl flex items-center justify-center text-gold font-syne font-bold text-2xl shadow-2xl">{n}</div>)}
                             </div>
                             <div className="grid grid-cols-2 gap-4 border-t border-ink/10 pt-6">
                                <div>
                                   <p className="text-[10px] font-bold uppercase opacity-60">Total Prize Pool</p>
                                   <p className="text-2xl font-black font-syne">£{simulation.pool.total}</p>
                                </div>
                                <div className="text-right">
                                   <p className="text-[10px] font-bold uppercase opacity-60">Total Winners</p>
                                   <p className="text-2xl font-black font-syne">{simulation.simulation.winners.length}</p>
                                </div>
                             </div>
                          </div>

                          <div className="space-y-2">
                             <div className="flex justify-between items-center p-4 bg-ink-3 border border-white/5 rounded-xl">
                                <span className="text-xs font-bold text-gray-400">Match 5 Pool (Jackpot)</span>
                                <span className="font-bold text-gold">£{simulation.pool.jackpot}</span>
                             </div>
                             <div className="flex justify-between items-center p-4 bg-ink-3 border border-white/5 rounded-xl">
                                <span className="text-xs font-bold text-gray-400">Match 4 Pool</span>
                                <span className="font-bold text-white">£{simulation.pool.tier4}</span>
                             </div>
                             <div className="flex justify-between items-center p-4 bg-ink-3 border border-white/5 rounded-xl">
                                <span className="text-xs font-bold text-gray-400">Match 3 Pool</span>
                                <span className="font-bold text-white">£{simulation.pool.tier3}</span>
                             </div>
                          </div>

                          <button 
                            onClick={handlePublish}
                            className="w-full py-4 bg-white text-ink font-bold rounded-xl hover:bg-gray-100 transition-all shadow-2xl mt-4"
                          >
                             Confirm & Publish Draw Results
                          </button>
                       </motion.div>
                    )}
                  </div>

                </div>
              </motion.div>
            )}

            {}
            {activeTab === 'winners' && (
              <motion.div key="winners" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8">
                 <h2 className="text-2xl font-syne font-black mb-8">Winner Verification Queue</h2>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead>
                          <tr className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-white/5">
                             <th className="pb-4">Winner</th>
                             <th className="pb-4">Draw</th>
                             <th className="pb-4">Tier</th>
                             <th className="pb-4">Amount</th>
                             <th className="pb-4">Proof</th>
                             <th className="pb-4">Status</th>
                             <th className="pb-4">Action</th>
                          </tr>
                       </thead>
                       <tbody className="text-sm">
                          {winners.map(w => (
                            <tr key={w.id} className="border-b border-white/5 hover:bg-white/[0.02] group">
                               <td className="py-6">
                                  <p className="font-bold">{w.profiles?.full_name}</p>
                                  <p className="text-[10px] text-gray-500">{w.profiles?.email}</p>
                               </td>
                               <td className="py-6">{w.draws?.month}</td>
                               <td className="py-6"><span className="text-gold font-bold">Match {w.tier}</span></td>
                               <td className="py-6 font-bold">£{w.amount}</td>
                               <td className="py-6 text-center">
                                  {w.proof_url ? <button className="p-2 bg-ink-3 rounded-lg text-gold hover:text-gold-light"><Eye size={16} /></button> : <span className="text-gray-600 text-[10px] italic">Not uploaded</span>}
                               </td>
                               <td className="py-6">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    w.status === 'verified' ? 'bg-teal-brand/10 text-teal-brand' : 
                                    w.status === 'pending' ? 'bg-gold/10 text-gold' : 'bg-red-500/10 text-red-500'
                                  }`}>
                                     {w.status}
                                  </span>
                               </td>
                               <td className="py-6">
                                  <div className="flex gap-2">
                                     <button className="p-2 border border-white/10 rounded-lg hover:border-teal-brand/50 text-teal-brand transition-colors"><CheckCircle2 size={16} /></button>
                                     <button className="p-2 border border-white/10 rounded-lg hover:border-red-500/50 text-red-400 transition-colors"><XCircle size={16} /></button>
                                  </div>
                               </td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </motion.div>
            )}

          </AnimatePresence>
        </section>
      </div>
    </main>
  );
}

function TabButton({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${active ? 'bg-ink-3 text-gold shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

function LogicOption({ id, label, desc, active, onClick }: { id: string, label: string, desc: string, active: boolean, onClick: (id: string) => void }) {
  return (
    <button onClick={() => onClick(id)} className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${active ? 'border-gold bg-gold/5' : 'border-white/5 hover:border-white/10 bg-ink-2'}`}>
       <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${active ? 'border-gold' : 'border-gray-700'}`}>
          {active && <div className="w-2 h-2 rounded-full bg-gold" />}
       </div>
       <div>
          <p className="text-sm font-bold text-white">{label}</p>
          <p className="text-[10px] text-gray-500">{desc}</p>
       </div>
    </button>
  );
}
