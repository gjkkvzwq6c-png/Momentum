import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, CheckCircle2, Focus } from 'lucide-react';
import { useStore } from '../../store/useStore';
import Button from '../shared/Button';
import ProgressRing from '../shared/ProgressRing';
import ConfettiEffect from '../shared/ConfettiEffect';
import { uuid } from '../../utils/uuid';

const PRESETS = [
  { label: '25 min', minutes: 25 },
  { label: '50 min', minutes: 50 },
  { label: '90 min', minutes: 90 },
];

export default function FocusMode() {
  const { state, addFocusSession, upsertDayEntry } = useStore();
  const [duration, setDuration] = useState(25 * 60);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [sessionGoal, setSessionGoal] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');
  const [confetti, setConfetti] = useState(false);
  const [completed, setCompleted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            handleComplete();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const handleComplete = () => {
    const mins = Math.round(duration / 60);
    const today = new Date().toISOString().split('T')[0];
    addFocusSession({ id: uuid(), goal: sessionGoal, notes: sessionNotes, duration: mins, completedAt: today });
    upsertDayEntry(today, { focusMinutes: (state.dayEntries[today]?.focusMinutes || 0) + mins });
    setConfetti(true);
    setCompleted(true);
    setTimeout(() => setConfetti(false), 100);
  };

  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setTimeLeft(duration);
    setCompleted(false);
  };

  const setPreset = (mins: number) => {
    const secs = mins * 60;
    setDuration(secs);
    setTimeLeft(secs);
    setRunning(false);
    setCompleted(false);
  };

  const progress = ((duration - timeLeft) / duration) * 100;
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const totalFocusMin = state.focusSessions.reduce((s, f) => s + f.duration, 0);

  return (
    <div className="space-y-4 pb-2">
      <ConfettiEffect trigger={confetti} />

      <div>
        <h2 className="text-xl font-bold text-white">Focus Mode</h2>
        <p className="text-xs text-gray-500 mt-0.5">Deep work sessions · {state.focusSessions.length} completed</p>
      </div>

      {/* Timer */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-8 flex flex-col items-center gap-6 relative overflow-hidden"
        style={{ background: running ? 'rgba(59,130,246,0.05)' : 'rgba(255,255,255,0.03)', border: running ? '1px solid rgba(59,130,246,0.2)' : '1px solid rgba(255,255,255,0.06)' }}>
        {/* Ambient pulse */}
        {running && (
          <motion.div className="absolute inset-0 rounded-3xl"
            animate={{ opacity: [0, 0.04, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{ background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.3) 0%, transparent 70%)' }} />
        )}

        <div className="relative">
          <ProgressRing value={progress} size={180} stroke={8} color={running ? '#3b82f6' : '#374151'}
            label={timeStr} sublabel={running ? 'Focus' : 'Ready'} />
          {running && (
            <motion.div className="absolute inset-0 rounded-full border-2 border-blue-500/20"
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} />
          )}
        </div>

        {/* Preset buttons */}
        <div className="flex gap-2 no-select">
          {PRESETS.map(p => (
            <button key={p.label} onClick={() => setPreset(p.minutes)}
              className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: duration === p.minutes * 60 ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${duration === p.minutes * 60 ? 'rgba(59,130,246,0.4)' : 'transparent'}`,
                color: duration === p.minutes * 60 ? '#60a5fa' : '#6b7280',
              }}>
              {p.label}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button onClick={reset} className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-white/10 transition-all">
            <RotateCcw size={16} className="text-gray-400" />
          </button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setRunning(r => !r)}
            className="w-16 h-16 rounded-full flex items-center justify-center transition-all"
            style={{ background: running ? '#ef4444' : '#3b82f6', boxShadow: `0 0 30px ${running ? '#ef444466' : '#3b82f666'}` }}>
            {running ? <Pause size={24} className="text-white" /> : <Play size={24} className="text-white ml-1" />}
          </motion.button>
          <div className="w-11" />
        </div>
      </motion.div>

      {/* Session Goal */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2">Session Goal</p>
        <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/40"
          placeholder="What will you accomplish in this session?" value={sessionGoal}
          onChange={e => setSessionGoal(e.target.value)} disabled={running} />
      </motion.div>

      {/* Completion message */}
      <AnimatePresence>
        {completed && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="glass rounded-2xl p-5 text-center"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <CheckCircle2 size={32} className="text-emerald-400 mx-auto mb-2" />
            <h3 className="text-lg font-bold text-white">Session Complete!</h3>
            <p className="text-sm text-gray-400 mt-1">+20 Momentum · Great work, keep it going.</p>
            <textarea className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none resize-none mt-3"
              placeholder="Session notes (optional)..." rows={2}
              value={sessionNotes} onChange={e => setSessionNotes(e.target.value)} />
            <Button onClick={reset} className="w-full mt-3">Start Another Session</Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="grid grid-cols-2 gap-3">
        {[
          { label: 'Total Sessions', value: state.focusSessions.length, color: '#3b82f6' },
          { label: 'Total Hours', value: `${Math.round(totalFocusMin / 60 * 10) / 10}h`, color: '#8b5cf6' },
        ].map(s => (
          <div key={s.label} className="glass rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Recent sessions */}
      {state.focusSessions.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Recent Sessions</h3>
          <div className="space-y-2">
            {[...state.focusSessions].reverse().slice(0, 5).map(s => (
              <div key={s.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(59,130,246,0.1)' }}>
                  <Focus size={14} className="text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300 truncate">{s.goal || 'Focus session'}</p>
                  <p className="text-xs text-gray-600">{s.duration} min · {s.completedAt}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
