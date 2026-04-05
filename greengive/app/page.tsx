import Navbar from '@/src/components/layout/Navbar';
import Hero from '@/src/components/landing/Hero';
import Stats from '@/src/components/landing/Stats';
import PlatformFeatures from '@/src/components/landing/PlatformFeatures';
import Leaderboard from '@/src/components/landing/Leaderboard';
import PrizePoolCalculator from '@/src/components/landing/PrizePoolCalculator';
import FeaturedCharities from '@/src/components/landing/FeaturedCharities';
import ReadyToPlay from '@/src/components/landing/ReadyToPlay';

export default function Home() {
  return (
    <main className="min-h-screen bg-ink flex flex-col pt-16">
      <Navbar />
      <section id="home"><Hero /></section>
      <Stats />
      <section id="how-it-works"><PlatformFeatures /></section>
      <section id="leaderboard"><Leaderboard /></section>
      <section id="prizes"><PrizePoolCalculator /></section>
      <section id="charities"><FeaturedCharities /></section>
      <ReadyToPlay />
      <footer className="py-12 text-center text-sm text-gray-600 border-t border-white/5 mt-auto">
        &copy; {new Date().getFullYear()} GreenGive. All rights reserved.
      </footer>
    </main>
  );
}
