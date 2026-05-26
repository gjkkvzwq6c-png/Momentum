import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from './store/useStore';
import Navigation from './components/Navigation';
import Onboarding from './components/Onboarding';
import Dashboard from './components/sections/Dashboard';
import Goals from './components/sections/Goals';
import Habits from './components/sections/Habits';
import StrategyVault from './components/sections/StrategyVault';
import YearlyPlanner from './components/sections/YearlyPlanner';
import Badges from './components/sections/Badges';
import Analytics from './components/sections/Analytics';
import FocusMode from './components/sections/FocusMode';
import Settings from './components/sections/Settings';
import type { NavSection } from './types';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};

export default function App() {
  const { state } = useStore();
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');

  // Apply theme to <html> whenever it changes
  useEffect(() => {
    const root = document.documentElement;
    if (state.user.theme === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      root.removeAttribute('data-theme');
    }
  }, [state.user.theme]);

  if (!state.user.onboardingComplete) {
    return <Onboarding />;
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard': return <Dashboard onNavigate={setActiveSection} />;
      case 'goals':     return <Goals />;
      case 'habits':    return <Habits />;
      case 'strategy':  return <StrategyVault />;
      case 'planner':   return <YearlyPlanner />;
      case 'badges':    return <Badges />;
      case 'analytics': return <Analytics />;
      case 'focus':     return <FocusMode />;
      case 'settings':  return <Settings />;
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <Navigation active={activeSection} onChange={setActiveSection} />
      <main className="pt-14 pb-20 px-4 max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          <motion.div key={activeSection}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="py-4">
            {renderSection()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
