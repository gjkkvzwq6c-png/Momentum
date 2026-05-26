import { motion } from 'framer-motion';
import { Home, Target, Repeat2, BookOpen, Calendar, Award, BarChart2, Focus, Settings, Zap } from 'lucide-react';
import type { NavSection } from '../types';

const navItems: { id: NavSection; icon: React.ReactNode; label: string }[] = [
  { id: 'dashboard', icon: <Home size={20} />, label: 'Home' },
  { id: 'goals', icon: <Target size={20} />, label: 'Goals' },
  { id: 'habits', icon: <Repeat2 size={20} />, label: 'Habits' },
  { id: 'strategy', icon: <BookOpen size={20} />, label: 'Vault' },
  { id: 'planner', icon: <Calendar size={20} />, label: 'Planner' },
  { id: 'badges', icon: <Award size={20} />, label: 'Badges' },
  { id: 'analytics', icon: <BarChart2 size={20} />, label: 'Stats' },
  { id: 'focus', icon: <Focus size={20} />, label: 'Focus' },
  { id: 'settings', icon: <Settings size={20} />, label: 'Settings' },
];

interface Props {
  active: NavSection;
  onChange: (s: NavSection) => void;
}

export default function Navigation({ active, onChange }: Props) {
  return (
    <>
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3"
        style={{ background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-bold text-sm tracking-wide text-gradient">Momentum OS</span>
        </div>
        <div className="text-xs text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</div>
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-40 px-2 pb-safe"
        style={{ background: 'rgba(10,10,15,0.97)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-around py-2 max-w-lg mx-auto">
          {navItems.map(item => {
            const isActive = active === item.id;
            return (
              <button key={item.id} onClick={() => onChange(item.id)}
                className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 relative"
                style={{ minWidth: 44 }}>
                {isActive && (
                  <motion.div layoutId="nav-pill"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: 'rgba(59,130,246,0.15)' }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                  />
                )}
                <span className={`relative transition-colors duration-200 ${isActive ? 'text-blue-400' : 'text-gray-500'}`}>
                  {item.icon}
                </span>
                <span className={`text-[9px] font-semibold relative transition-colors duration-200 ${isActive ? 'text-blue-400' : 'text-gray-600'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
