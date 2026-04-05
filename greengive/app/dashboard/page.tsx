'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/src/supabase/client';
import { getScores, submitScore, deleteScore } from '@/src/lib/api';
import Navbar from '@/src/components/layout/Navbar';
import { Calendar, Trophy, Heart, Trash2, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function UserDashboard() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [scores, setScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scoreInput, setScoreInput] = useState('');
  const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);
const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [backendOffline, setBackendOffline] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return window.location.href = '/auth/login';
      
      setUser(user);
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select(`
          *,
          charities (
            name
          ),
          winners (*)
        `)
        .eq('id', user.id)
        .maybeSingle(); 
      
      if (profileErr) throw profileErr;

      if (!profileData) {
        
        console.log("Profile missing for user, creating...");
        const { data: newProfile, error: createErr } = await supabase
          .from('profiles')
          .insert({ 
            id: user.id, 
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0]
          })
          .select('*, charities(name)')
          .maybeSingle();
        
        if (createErr) {
          console.warn("Could not auto-create profile (likely RLS). Falling back to mock data.", createErr);
          setProfile({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Golfer',
            subscription_status: 'inactive',
            charity_id: null
          });
        } else {
          setProfile(newProfile);
        }
      } else {
        setProfile(profileData);
      }


      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.access_token) {
        try {
          const { data: scoresData } = await getScores(session.session.access_token);
          setScores(scoresData || []);
          setBackendOffline(false);
        } catch (apiErr) {
          console.error("Backend connection failed:", apiErr);
          setBackendOffline(true);
        }
      }
    } catch (err: any) {
      console.error("Dashboard load failed detailed:", {
        message: err.message,
        code: err.code,
        details: err.details,
        hint: err.hint
      });
      setMessage({ 
        type: 'error', 
        text: `Failed to load profile data: ${err.message || 'Unknown error'}` 
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const simulatePaymentSuccess = async () => {
    if (!profile) return;
    setRefreshing(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('profiles')
        .update({ 
          subscription_status: 'active',
          subscription_plan: 'monthly',
          renewal_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
        .eq('id', profile.id);
      
      if (error) throw error;
      setMessage({ type: 'success', text: 'Membership activated! (Dev Simulation)' });
      fetchUserData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setRefreshing(false);
    }
  };

  const handleAddScore = async (e: React.FormEvent) => {
    e.preventDefault();
    const scoreVal = parseInt(scoreInput);
    if (isNaN(scoreVal) || scoreVal < 1 || scoreVal > 45) {
      return setMessage({ type: 'error', text: 'Score must be between 1 and 45' });
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const supabase = createClient();
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) throw new Error('Not authenticated');

      await submitScore(scoreVal, dateInput, session.session.access_token);
      setMessage({ type: 'success', text: 'Score added! The oldest score was removed.' });
      setScoreInput('');
      fetchUserData(); // Refresh list
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to add score' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteScore = async (id: string) => {
    try {
      const supabase = createClient();
      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.access_token) {
        await deleteScore(id, session.session.access_token);
        fetchUserData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-ink flex items-center justify-center">
      <div className="w-8 h-8 border-t-2 border-gold rounded-full animate-spin" />
    </div>
  );

  return (
    <main className="min-h-screen bg-ink text-white pt-24 pb-12">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-6">
        <header className="mb-12">
          <h1 className="text-4xl font-syne font-black mb-2">
            Welcome, <span className="text-gold">{profile?.full_name?.split(' ')[0] || 'Golfer'}</span>
          </h1>
          <p className="text-gray-400">Manage your subscription, scores, and impact.</p>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          {}
          <div className="lg:col-span-2 space-y-8">
            
            <section className="bg-ink-2 border border-white/5 rounded-2xl p-8 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Trophy size={120} />
              </div>

              <div className="flex items-center justify-between mb-8 relative z-10">
                <h2 className="text-2xl font-syne font-bold flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-lg">🏌️</span>
                  Last 5 Scores
                </h2>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Newest in • Oldest out
                </div>
              </div>

              {message && (
                <div className={`mb-6 flex items-center gap-3 p-4 rounded-xl border ${
                  message.type === 'success' ? 'bg-teal-brand/10 border-teal-brand/20 text-teal-brand' : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}>
                  {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  <span className="text-sm font-medium">{message.text}</span>
                </div>
              )}

              <form onSubmit={handleAddScore} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Stableford Score</label>
                  <input
                    type="number"
                    value={scoreInput}
                    onChange={e => setScoreInput(e.target.value)}
                    placeholder="1-45"
                    className="w-full bg-ink-3 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors"
                    required
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Date Played</label>
                  <input
                    type="date"
                    value={dateInput}
                    onChange={e => setDateInput(e.target.value)}
                    className="w-full bg-ink-3 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors"
                  />
                </div>
                <div className="col-span-2 flex items-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-[50px] bg-white text-ink font-bold rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                  >
                    {submitting ? '...' : <><Plus size={18} /> Add Score</>}
                  </button>
                </div>
              </form>

              <div className="space-y-3">
                {backendOffline ? (
                  <div className="py-12 text-center border-2 border-dashed border-red-500/20 bg-red-500/5 rounded-2xl">
                    <AlertCircle className="mx-auto text-red-500 mb-3" size={24} />
                    <p className="text-red-400 text-sm font-bold uppercase tracking-widest mb-1">Backend Connection Error</p>
                    <p className="text-gray-500 text-xs italic">Make sure your game server is running on port 4000.</p>
                    <button onClick={() => { setRefreshing(true); fetchUserData(); }} className="mt-4 text-xs font-bold text-white underline">Retry Connection</button>
                  </div>
                ) : scores.length === 0 ? (
                  <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-2xl">
                    <p className="text-gray-500 text-sm italic">No scores entered yet. Enter 5 to be draw-ready.</p>
                  </div>
                ) : (
                  scores.map((s) => (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 bg-ink-3/50 border border-white/5 rounded-xl hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gold/5 border border-gold/10 flex items-center justify-center text-gold font-syne font-bold text-xl">
                          {s.score}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">Stableford Points</p>
                          <p className="text-[10px] text-gray-500 font-medium italic">Played: {new Date(s.played_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteScore(s.id)}
                        className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>
            </section>

            <section className="bg-ink-2 border border-white/5 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <Trophy size={100} />
              </div>
              <h2 className="text-2xl font-syne font-bold mb-8 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-teal-brand/10 border border-teal-brand/20 flex items-center justify-center text-lg">💰</span>
                Winnings Overview
              </h2>
              
              {profile?.winners?.length > 0 ? (
                <div className="space-y-4">
                   {profile.winners.map((win: any) => (
                     <div key={win.id} className="p-6 bg-ink-3/50 border border-white/5 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                           <p className="text-xs font-bold text-gold uppercase tracking-widest mb-1">Match {win.tier} Winner</p>
                           <p className="text-2xl font-black font-syne">£{win.amount}</p>
                           <p className="text-[10px] text-gray-500 italic mt-1">Pending verification from platform admins.</p>
                        </div>
                        
                        <div className="flex flex-col items-center md:items-end gap-3">
                           <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                             win.status === 'verified' ? 'bg-teal-brand/10 text-teal-brand' : 
                             win.status === 'pending' ? 'bg-gold/10 text-gold shadow-[0_0_15px_rgba(201,168,76,0.1)]' : 'bg-red-500/10 text-red-500'
                           }`}>
                              {win.status}
                           </span>
                           
                           {win.status === 'pending' && !win.proof_url && (
                             <label className="cursor-pointer bg-white text-ink text-[10px] font-bold px-4 py-2 rounded-lg hover:shadow-xl transition-all">
                                Upload Score Screenshot
                                <input 
                                  type="file" 
                                  className="hidden" 
                                  accept="image/*"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    setSubmitting(true);
                                    try {
                                      const supabase = createClient();
                                      const path = `winners/${win.id}/${file.name}`;
                                      const { error: uploadError } = await supabase.storage.from('winner-proofs').upload(path, file);
                                      if (uploadError) throw uploadError;

                                      const { data: { publicUrl } } = supabase.storage.from('winner-proofs').getPublicUrl(path);
                                      await supabase.from('winners').update({ proof_url: publicUrl, status: 'pending' }).eq('id', win.id);
                                      setMessage({ type: 'success', text: 'Proof uploaded successfully! Admins will review it soon.' });
                                      fetchUserData();
                                    } catch (err: any) {
                                      setMessage({ type: 'error', text: 'Upload failed: ' + err.message });
                                    } finally {
                                      setSubmitting(false);
                                    }
                                  }} 
                                />
                             </label>
                           )}
                        </div>
                     </div>
                   ))}
                </div>
              ) : (
                <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-2xl">
                  <p className="text-gray-500 text-sm italic">You haven&apos;t won in the draws yet. Good luck for the next one!</p>
                </div>
              )}
            </section>
          </div>

          <div className="space-y-8">
            <section className="bg-ink-2 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-8 bg-gradient-to-br from-gold/20 to-transparent border-b border-white/5">
                <h3 className="text-xs font-bold text-gold uppercase tracking-[0.2em] mb-4">Subscription Status</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl font-syne font-black text-white capitalize">{profile?.subscription_status || 'Inactive'}</span>
                  <div className={`w-3 h-3 rounded-full ${profile?.subscription_status === 'active' ? 'bg-teal-brand animate-pulse' : 'bg-gray-500'}`} />
                </div>
                <p className="text-xs font-medium text-gray-400">
                  {profile?.subscription_plan === 'yearly' ? 'Annual Gold Member' : 'Monthly Member'}
                </p>
                {profile?.subscription_status !== 'active' && (
                  <button 
                    onClick={simulatePaymentSuccess}
                    className="mt-4 w-full py-2 bg-gold/10 border border-gold/30 text-gold text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-gold/20 transition-all"
                  >
                    🚀 DEV: Simulate Payment
                  </button>
                )}
              </div>
              <div className="p-8 space-y-4">
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <Calendar size={16} className="text-gold" />
                  <span>Renewal Date: <span className="text-white font-medium">{profile?.renewal_date ? new Date(profile.renewal_date).toLocaleDateString() : 'N/A'}</span></span>
                </div>
                <button className="w-full py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-sm font-bold">
                  Manage Billing
                </button>
              </div>
            </section>

            <section className="bg-ink-2 border border-white/5 rounded-2xl p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                 <Heart size={18} className="text-red-400 fill-red-400/20" />
                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Selected Charity</h3>
              </div>
              <p className="font-syne text-xl font-bold text-white mb-2">{profile?.charity_id ? profile.charities?.name : 'No Charity Selected'}</p>
              <div className="inline-flex items-center gap-2 text-[10px] font-bold text-teal-brand px-2 py-0.5 bg-teal-brand/10 border border-teal-brand/20 rounded-full mb-6">
                {profile?.charity_pct}% Contribution
              </div>
              <button className="w-full py-3 rounded-xl bg-ink-3 border border-white/5 hover:border-gold/30 transition-colors text-sm font-bold text-gold">
                Change Charity
              </button>
            </section>

          </div>
        </div>
      </div>
    </main>
  );
}
