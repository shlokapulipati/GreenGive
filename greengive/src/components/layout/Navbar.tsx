'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { X, Menu, LogOut, LayoutDashboard } from 'lucide-react';
import { createClient } from '@/src/supabase/client';
import type { Session, User } from '@supabase/supabase-js';

const navLinks = [
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'Charities', href: '/charities' },
  { label: 'Prizes', href: '/draws' },
  { label: 'Leaderboard', href: '/#leaderboard' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }: { data: { user: User | null } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUserMenuOpen(false);
    setMobileOpen(false);
    router.push('/');
  };

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#')) {
      if (pathname === '/') {
        e.preventDefault();
        setMobileOpen(false);
        const id = href.replace('/#', '');
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else {
        setMobileOpen(false);
      }
    } else {
      setMobileOpen(false);
    }
  };

  const userInitial = user?.user_metadata?.full_name?.[0]?.toUpperCase() 
    || user?.email?.[0]?.toUpperCase() 
    || '?';

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-ink-2/95 backdrop-blur-md shadow-2xl border-b border-white/5' : 'bg-transparent'}`}>
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          {}
          <Link href="/" className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M4 19H20" stroke="#f0d080" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 19V5C7 4.44772 7.44772 4 8 4H10C10.5523 4 11 4.44772 11 5V19" fill="#c9a84c"/>
              <path d="M11 5L15 7L11 9V5Z" fill="#f0d080"/>
            </svg>
            <span className="font-syne font-bold text-xl tracking-tight text-white">
              <span className="text-gold-light">Green</span>Give
            </span>
          </Link>

          {}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleAnchorClick(e, link.href)}
                className="hover:text-white transition-colors cursor-pointer"
              >
                {link.label}
              </a>
            ))}

            {user ? (
                            <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 group"
                >
                  <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-gold text-sm font-bold hover:bg-gold/30 transition-colors">
                    {userInitial}
                  </div>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-ink-2 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-white/5">
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <LayoutDashboard size={15} />
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut size={15} />
                      Log out
                    </button>
                  </div>
                )}

                {}
                {userMenuOpen && (
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                )}
              </div>
            ) : (
                            <>
                <Link
                  href="/auth/login"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/auth/signup"
                  className="border border-white/20 rounded-full px-4 py-2 hover:bg-white/5 transition-colors flex items-center gap-2 text-white"
                >
                  Start Playing <span className="opacity-70">→</span>
                </Link>
              </>
            )}
          </div>

          {}
          <button
            className="md:hidden p-2 text-gray-400 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-ink/95 backdrop-blur-md flex flex-col pt-20 px-6 md:hidden">
          <nav className="flex flex-col gap-6 mt-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleAnchorClick(e, link.href)}
                className="text-2xl font-syne font-bold text-white hover:text-gold transition-colors"
              >
                {link.label}
              </a>
            ))}
            <hr className="border-white/10 my-2" />
            {user ? (
              <>
                <p className="text-sm text-gray-500">{user.email}</p>
                <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="text-xl font-syne text-gray-300 hover:text-white flex items-center gap-3">
                  <LayoutDashboard size={20} /> Dashboard
                </Link>
                <button onClick={handleLogout} className="text-xl font-syne text-red-400 hover:text-red-300 flex items-center gap-3 text-left">
                  <LogOut size={20} /> Log out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="text-xl font-syne text-gray-300 hover:text-white">
                  Log in
                </Link>
                <Link href="/auth/signup" onClick={() => setMobileOpen(false)} className="text-xl font-syne text-white font-bold">
                  Start Playing →
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </>
  );
}
