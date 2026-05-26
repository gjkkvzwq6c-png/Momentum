import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, TrendingUp, Flame, Zap, MessageSquare, ChevronRight, Plus, Target, Repeat2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import ProgressRing from '../shared/ProgressRing';
import ProgressBar from '../shared/ProgressBar';
import Button from '../shared/Button';
import ConfettiEffect from '../shared/ConfettiEffect';
import type { NavSection } from '../../types';

const QUOTES = [
  "Success is the sum of small efforts, repeated day in and day out.",
  "The secret of getting ahead is getting started.",
  "Don't watch the clock; do what it does. Keep going.",
  "You don't have to be great to start, but you have to start to be great.",
  "Hustle in silence and let your success make the noise.",
  "The only limit to our realization of tomorrow is our doubts of today.",
  "Discipline is choosing between what you want now and what you want most.",
  "Your future self is watching you right now. Make them proud.",
];

interface Props { onNavigate: (s: NavSection) => void; }

export default function Dashboard({ onNavigate }: Props) {
  const { state, completeHabit, submitCheckIn, upsertDayEntry } = useStore();
  const [todayWin, setTodayWin] = useState(state.dayEntries[new Date().toISOString().split('T')[0]]?.win || '');
  const [confetti, setConfetti] = useState(false);
  const [checkInDone, setCheckInDone] = useState(state.lastCheckIn === new Date().toISOString().split('T')[0]);
  const [winSaved, setWinSaved] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const quote = QUOTES[new Date().getDay()];
  const greeting = state.user.name ? `Let's build momentum today, ${state.user.name}.` : "Let's build momentum today.";
  const scorePercent = Math.min(100, (state.momentumScore / 1000) * 100);
  const pendingHabits = state.habits.filter(h => !h.completedToday);
  const topGoal = state.macroGoals[0];
  const hasHabits = state.habits.length > 0;
  const hasGoals = state.macroGoals.length > 0;

  const handleHabit = (id: string) => {
    completeHabit(id);
    setConfetti(true);
    setTimeout(() => setConfetti(false), 100);
  };

  const handleCheckIn = () => {
    if (checkInDone) return;
    submitCheckIn();
    setCheckInDone(true);
    setConfetti(true);
    setTimeout(() => setConfetti(false), 100);
  };

  const saveWin = () => {
    upsertDayEntry(today, { win: todayWin });
    setWinSaved(true);
    setTimeout(() => setWinSaved(false), 2000);
  };

  return (
    <div className="space-y-4 pb-2">
      <ConfettiEffect trigger={confetti} />

      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white leading-tight">{greeting}</h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </motion.div>

      {/* Momentum Score */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="glass rounded-2xl p-5 flex items-center gap-5"
        style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
        <ProgressRing value={scorePercent} size={100} stroke={7} color="#3b82f6"
          label={String(state.momentumScore)} sublabel="Score" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={14} className="text-blue-400" />
            <span className="text-xs text-blue-400 font-semibold uppercase tracking-widest">Momentum Score</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {state.momentumScore}<span className="text-gray-500 text-base">/1000</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {state.momentumScore === 0 ? 'Check in, complete habits & goals to build your score' : 'Keep building — every action counts'}
          </p>
          <div className="mt-3">
            <ProgressBar value={state.momentumScore} max={1000} />
          </div>
        </div>
      </motion.div>

      {/* Daily Check-In — always visible, most important first action */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}
        className="glass rounded-2xl p-5"
        style={{
          background: checkInDone ? 'rgba(16,185,129,0.06)' : 'rgba(59,130,246,0.06)',
          border: `1px solid ${checkInDone ? 'rgba(16,185,129,0.2)' : 'rgba(59,130,246,0.2)'}`,
        }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white text-sm">
              {checkInDone ? 'Check-In Complete' : 'Daily Check-In'}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {checkInDone ? '+25 Momentum added to your score' : 'Start your day strong · +25 pts'}
            </p>
          </div>
          <Button
            onClick={handleCheckIn}
            disabled={checkInDone}
            variant={checkInDone ? 'secondary' : 'primary'}
            size="sm">
            {checkInDone ? '✓ Done' : 'Check In'}
          </Button>
        </div>
      </motion.div>

      {/* Today's Priorities — habits or empty state */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.09 }}
        className="glass rounded-2xl p-5" style={{ background: 'var(--bg-card)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-blue-400" />
            <h3 className="font-semibold text-white text-sm">Today's Priorities</h3>
          </div>
          {hasHabits && (
            <button onClick={() => onNavigate('habits')} className="text-xs text-blue-400">View all</button>
          )}
        </div>

        {hasHabits ? (
          <div className="space-y-3">
            {pendingHabits.slice(0, 3).map((habit, i) => (
              <motion.div key={habit.id} whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 cursor-pointer" onClick={() => handleHabit(habit.id)}>
                <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
                  style={{ borderColor: habit.completedToday ? '#10b981' : 'rgba(255,255,255,0.2)' }}>
                  {habit.completedToday && <CheckCircle2 size={14} className="text-emerald-400" />}
                </div>
                <span className={`flex-1 text-sm ${habit.completedToday ? 'line-through text-gray-600' : 'text-gray-300'}`}>
                  {habit.name}
                </span>
                <span className="text-xs text-gray-600">#{i + 1}</span>
              </motion.div>
            ))}
            {pendingHabits.length === 0 && (
              <div className="flex items-center gap-2 py-1">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <p className="text-sm text-emerald-400 font-medium">All habits done. Outstanding work.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="py-3 text-center space-y-3">
            <div className="w-10 h-10 rounded-2xl mx-auto flex items-center justify-center"
              style={{ background: 'rgba(59,130,246,0.1)' }}>
              <Repeat2 size={18} className="text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-300">Build the habits that build the business.</p>
              <p className="text-xs text-gray-600 mt-0.5">Your top 3 daily habits will appear here.</p>
            </div>
            <Button onClick={() => onNavigate('habits')} size="sm" className="mx-auto flex items-center gap-1.5">
              <Plus size={13} /> Add First Habit
            </Button>
          </div>
        )}
      </motion.div>

      {/* Active Goal — or empty state */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.11 }}>
        {hasGoals && topGoal ? (
          <div className="glass rounded-2xl p-5 cursor-pointer" style={{ background: 'var(--bg-card)' }}
            onClick={() => onNavigate('goals')}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-blue-400" />
                <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Active Goal</span>
              </div>
              <ChevronRight size={14} className="text-gray-600" />
            </div>
            <h3 className="font-bold text-white text-sm mb-1">{topGoal.title}</h3>
            <p className="text-xs text-gray-500 mb-3">
              {topGoal.microGoals.filter(m => m.status === 'completed').length}/{topGoal.microGoals.length} milestones
              {topGoal.deadline && ` · Due ${new Date(topGoal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
            </p>
            <div className="flex items-center gap-3">
              <ProgressBar value={topGoal.progress} />
              <span className="text-sm font-bold text-blue-400 shrink-0">{topGoal.progress}%</span>
            </div>
          </div>
        ) : (
          <div className="glass rounded-2xl p-5 cursor-pointer" style={{ background: 'var(--bg-card)' }}
            onClick={() => onNavigate('goals')}>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} className="text-blue-400" />
              <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Macro Goal</span>
            </div>
            <div className="text-center py-3 space-y-3">
              <div className="w-10 h-10 rounded-2xl mx-auto flex items-center justify-center"
                style={{ background: 'rgba(59,130,246,0.1)' }}>
                <Target size={18} className="text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-300">Your biggest wins start here.</p>
                <p className="text-xs text-gray-600 mt-0.5">Create your first Macro Goal to start tracking progress.</p>
              </div>
              <Button size="sm" className="mx-auto flex items-center gap-1.5" onClick={e => { e.stopPropagation(); onNavigate('goals'); }}>
                <Plus size={13} /> Create First Goal
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Habit Streaks — only shown when habits exist */}
      {hasHabits && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }}
          className="glass rounded-2xl p-5" style={{ background: 'var(--bg-card)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame size={14} className="text-orange-400" />
              <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Habit Streaks</span>
            </div>
            <button onClick={() => onNavigate('habits')} className="text-xs text-blue-400">View all</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {state.habits.map(h => (
              <div key={h.id} className="flex flex-col items-center gap-1.5 shrink-0">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl"
                  style={{
                    background: h.completedToday ? `${h.color}22` : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${h.completedToday ? h.color + '44' : 'transparent'}`,
                  }}>
                  {h.icon}
                </div>
                <span className="text-xs font-bold" style={{ color: h.completedToday ? '#10b981' : '#9ca3af' }}>
                  {h.streak > 0 ? `${h.streak}d` : 'New'}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Today's Win */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="glass rounded-2xl p-5" style={{ background: 'var(--bg-card)' }}>
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare size={14} className="text-purple-400" />
          <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Today's Win</span>
        </div>
        <textarea
          className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/40 resize-none"
          style={{ background: 'var(--bg-input)', borderColor: 'var(--border-input)', color: 'var(--text-1)' }}
          placeholder="What's one thing you're proud of today?"
          rows={2}
          value={todayWin}
          onChange={e => setTodayWin(e.target.value)}
          onBlur={saveWin}
        />
        <AnimatePresence>
          {winSaved && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-xs text-emerald-400 mt-1.5">
              Win saved!
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Quote */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.17 }}
        className="glass rounded-2xl p-5 text-center"
        style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.1)' }}>
        <p className="text-sm text-gray-300 italic leading-relaxed">"{quote}"</p>
      </motion.div>
    </div>
  );
}
