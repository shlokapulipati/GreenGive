'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Check, Heart, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/src/supabase/client';
import { createCheckoutSession } from '@/src/lib/api';

const PLANS = [
  { id: 'monthly', label: 'Monthly', price: '£9.99', per: '/month', priceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID || 'price_monthly' },
  { id: 'yearly', label: 'Yearly', price: '£99', per: '/year', badge: 'Save 17%', priceId: process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID || 'price_yearly' },
];

const MOCK_CHARITIES = [
  { id: 'mock-1', name: 'Green Links Foundation', description: 'Providing youth access to professional golf coaching and equipment.', image_url: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&q=80', raised_amount: 12500, goal_amount: 50000, featured: true },
  { id: 'mock-2', name: 'Fairway to Heaven', description: 'Supporting mental health initiatives through outdoor sports and community golfing.', image_url: 'https://images.unsplash.com/photo-1592919505780-303950717480?w=800&q=80', raised_amount: 8400, goal_amount: 20000 },
  { id: 'mock-3', name: 'Birdies for Beds', description: 'Combating local homelessness with every birdie scored by our members.', image_url: 'https://images.unsplash.com/photo-1535498730771-e735b998cd64?w=800&q=80', raised_amount: 32000, goal_amount: 40000 }
];


export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<'details' | 'charity' | 'plan'>('details');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  
  const [charities, setCharities] = useState<any[]>([]);
  const [selectedCharity, setSelectedCharity] = useState<string | null>(null);
  const [charitySearch, setCharitySearch] = useState('');
  
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
  };

  const handleDetails = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('charity');
  };

  const handleCharity = () => {
    if (!selectedCharity) return setError('Please select a charity to support.');
    setError('');
    setStep('plan');
  };

  const handleSubscribe = async () => {
    setLoading(true);
    setError('');
    try {
      const supabase = createClient();
      const cleanEmail = email.trim().replace(/['\"]/g, '');
      
      const isMockCharity = selectedCharity?.startsWith('mock-');
      
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: { data: { full_name: fullName, charity_id: isMockCharity ? null : selectedCharity } },
      });

      if (signUpError) throw signUpError;
      if (!signUpData.user) throw new Error('Account creation failed');

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        router.push('/auth/confirm-email?email=' + encodeURIComponent(email));
        return;
      }

      const plan = PLANS.find(p => p.id === selectedPlan)!;
      const { url } = await createCheckoutSession(plan.priceId, signUpData.user.id, email, token);

      if (url) window.location.href = url;
      else router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const filteredCharities = charities.filter(c => c.name.toLowerCase().includes(charitySearch.toLowerCase()));

  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />

      {}
      <div className="flex items-center gap-4 mb-12 relative z-10">
        {(['details', 'charity', 'plan'] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-4">
             <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
               step === s ? 'bg-gold text-ink' : i < (step === 'details' ? 0 : step === 'charity' ? 1 : 2) ? 'bg-teal-brand text-white' : 'bg-white/5 text-gray-500'
             }`}>
               {i < (step === 'details' ? 0 : step === 'charity' ? 1 : 2) ? <Check size={16}/> : i + 1}
             </div>
             {i < 2 && <div className="w-12 h-px bg-white/10" />}
          </div>
        ))}
      </div>

      <motion.div key={step} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-xl relative z-10">
        <div className="bg-ink-2 border border-white/5 rounded-3xl p-10 shadow-2xl">
          
          <AnimatePresence mode="wait">
            {step === 'details' && (
              <motion.div key="details" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h1 className="text-3xl font-syne font-black mb-1">Create your profile</h1>
                <p className="text-gray-400 mb-8">Join the community of golfers giving back.</p>
                <form onSubmit={handleDetails} className="space-y-4">
                   <InputField label="Full Name" value={fullName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)} placeholder="John Doe" />
                   <InputField label="Email Address" type="email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} placeholder="john@example.com" />
                   <div className="relative">
                     <InputField label="Password" type={showPw ? 'text' : 'password'} value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} placeholder="Min 8 characters" />
                     <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-10 text-gray-500">{showPw ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
                   </div>
                   <button type="submit" className="w-full py-4 bg-white text-ink font-bold rounded-xl mt-4 hover:shadow-xl transition-all">Next: Select Charity →</button>
                </form>
              </motion.div>
            )}

            {step === 'charity' && (
              <motion.div key="charity" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h1 className="text-3xl font-syne font-black mb-1">Select your cause</h1>
                <p className="text-gray-400 mb-8">Choose which charity will receive 10% of your subscription.</p>
                
                <div className="relative mb-6">
                   <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                   <input type="text" placeholder="Search charities..." value={charitySearch} onChange={e => setCharitySearch(e.target.value)}
                    className="w-full bg-ink-3 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-gold/30 transition-colors" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto mb-8 pr-2 custom-scrollbar">
                   {filteredCharities.map(c => (
                     <button key={c.id} onClick={() => setSelectedCharity(c.id)} className={`p-4 rounded-xl border text-left transition-all ${
                       selectedCharity === c.id ? 'bg-gold/10 border-gold shadow-[0_0_20px_rgba(201,168,76,0.1)]' : 'bg-ink-3 border-white/5 hover:border-white/10'
                     }`}>
                        <p className={`font-bold text-sm ${selectedCharity === c.id ? 'text-gold' : 'text-white'}`}>{c.name}</p>
                        <p className="text-[10px] text-gray-500 mt-1 line-clamp-1">{c.description}</p>
                     </button>
                   ))}
                </div>

                {error && <p className="text-red-400 text-xs mb-4 text-center">{error}</p>}
                
                <div className="flex gap-4">
                   <button onClick={() => setStep('details')} className="w-1/3 py-4 border border-white/10 rounded-xl font-bold text-gray-500 hover:text-white transition-all">Back</button>
                   <button onClick={handleCharity} className="flex-1 py-4 bg-white text-ink font-bold rounded-xl hover:shadow-xl transition-all">Next: Choose Plan →</button>
                </div>
              </motion.div>
            )}

            {step === 'plan' && (
              <motion.div key="plan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h1 className="text-3xl font-syne font-black mb-1">Choose your plan</h1>
                <p className="text-gray-400 mb-8">All plans include draw entry and charity donation.</p>
                
                <div className="space-y-4 mb-8">
                   {PLANS.map(p => (
                     <button key={p.id} onClick={() => setSelectedPlan(p.id)} className={`w-full p-6 rounded-2xl border flex justify-between items-center transition-all ${
                       selectedPlan === p.id ? 'bg-gold border-gold text-ink shadow-2xl' : 'bg-ink-3 border-white/5 text-white hover:border-white/10'
                     }`}>
                        <div>
                          <p className="font-syne font-black text-xl">{p.label}</p>
                          <p className={`text-[10px] font-bold uppercase tracking-widest ${selectedPlan === p.id ? 'text-ink/60' : 'text-gray-500'}`}>Monthly Entry & Support</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black">{p.price}</p>
                          <p className={`text-[10px] font-bold ${selectedPlan === p.id ? 'text-ink/60' : 'text-gray-500'}`}>{p.per}</p>
                        </div>
                     </button>
                   ))}
                </div>

                {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center font-bold">{error}</div>}

                <button onClick={handleSubscribe} disabled={loading} className="w-full py-5 bg-white text-ink font-black rounded-xl text-lg hover:shadow-2xl transition-all disabled:opacity-50">
                  {loading ? 'Creating Member Profile...' : 'Complete Signup & Play →'}
                </button>
                <button onClick={() => setStep('charity')} className="w-full text-center text-gray-500 text-sm mt-6 hover:text-white transition-all">← Back to charity selection</button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </motion.div>
    </div>
  );
}

function InputField({ label, onChange, ...props }: { label: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; [key: string]: any }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">{label}</label>
      <input
        {...props}
        onChange={onChange}
        className="w-full bg-ink-3 border border-white/5 rounded-xl px-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-gold/30 transition-all font-medium"
      />
    </div>
  );
}
