import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Flame, Trash2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import { Input, Select } from '../shared/Input';
import ConfettiEffect from '../shared/ConfettiEffect';
import { uuid } from '../../utils/uuid';
import type { Habit } from '../../types';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];
const ICONS = ['💪', '📞', '🧠', '📱', '📚', '🏃', '✍️', '💰', '🎯', '🙏', '💎', '⚡'];

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000);
    return d.toISOString().split('T')[0];
  });
}

function weekCompletion(habit: Habit): number {
  const days = getLast7Days();
  const done = days.filter(d => habit.completionHistory[d]).length;
  return Math.round((done / 7) * 100);
}

export default function Habits() {
  const { state, addHabit, deleteHabit, completeHabit } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [form, setForm] = useState({ name: '', frequency: 'daily', color: COLORS[0], icon: ICONS[0] });

  const last7 = getLast7Days();

  const handleComplete = (id: string) => {
    completeHabit(id);
    setConfetti(true);
    setTimeout(() => setConfetti(false), 100);
  };

  const submit = () => {
    const habit: Habit = {
      id: uuid(), name: form.name, frequency: form.frequency as 'daily' | 'weekly',
      streak: 0, bestStreak: 0, completedToday: false,
      completionHistory: {}, color: form.color, icon: form.icon,
      createdAt: new Date().toISOString(),
    };
    addHabit(habit);
    setShowAdd(false);
    setForm({ name: '', frequency: 'daily', color: COLORS[0], icon: ICONS[0] });
  };

  const completedCount = state.habits.filter(h => h.completedToday).length;
  const totalHabits = state.habits.length;

  return (
    <div className="space-y-4 pb-2">
      <ConfettiEffect trigger={confetti} />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Habits</h2>
          <p className="text-xs text-gray-500 mt-0.5">{completedCount}/{totalHabits} completed today</p>
        </div>
        <Button onClick={() => setShowAdd(true)} size="sm" className="flex items-center gap-1.5">
          <Plus size={14} /> New Habit
        </Button>
      </div>

      {/* Today summary — only show when habits exist */}
      {totalHabits > 0 && <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Today's Progress</p>
            <p className="text-2xl font-bold text-white mt-1">{completedCount}<span className="text-gray-500 text-base">/{totalHabits}</span></p>
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalHabits }).map((_, i) => (
              <div key={i} className="w-2.5 h-2.5 rounded-full transition-all duration-500"
                style={{ background: i < completedCount ? '#3b82f6' : 'rgba(255,255,255,0.1)' }} />
            ))}
          </div>
        </div>
      </motion.div>}

      {/* Habit List */}
      <div className="space-y-3">
        {state.habits.map((habit, index) => (
          <motion.div key={habit.id} layout
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}
            className="glass rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: habit.completedToday ? `1px solid ${habit.color}30` : '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-start gap-3">
              {/* Check button */}
              <motion.button whileTap={{ scale: 0.85 }} onClick={() => !habit.completedToday && handleComplete(habit.id)}
                className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all"
                style={{ background: habit.completedToday ? `${habit.color}22` : 'rgba(255,255,255,0.05)', border: `2px solid ${habit.completedToday ? habit.color : 'rgba(255,255,255,0.1)'}` }}>
                <AnimatePresence mode="wait">
                  {habit.completedToday
                    ? <motion.span key="done" initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-xl">{habit.icon}</motion.span>
                    : <motion.span key="todo" className="text-xl opacity-60">{habit.icon}</motion.span>
                  }
                </AnimatePresence>
              </motion.button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className={`font-semibold text-sm ${habit.completedToday ? 'text-gray-400' : 'text-white'}`}>
                    {habit.completedToday && '✓ '}{habit.name}
                  </h3>
                  <button onClick={() => deleteHabit(habit.id)} className="p-1 rounded hover:bg-white/10 transition-all">
                    <Trash2 size={12} className="text-gray-600" />
                  </button>
                </div>

                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Flame size={11} style={{ color: habit.streak > 7 ? '#f97316' : '#6b7280' }} />
                    {habit.streak}d streak
                  </span>
                  <span>Best: {habit.bestStreak}d</span>
                  <span>{weekCompletion(habit)}% this week</span>
                </div>

                {/* Last 7 days */}
                <div className="flex gap-1.5 mt-2.5">
                  {last7.map(day => (
                    <div key={day} className="flex flex-col items-center gap-1">
                      <div className="w-5 h-5 rounded-md transition-all"
                        style={{ background: habit.completionHistory[day] ? habit.color : (day === last7[6] && !habit.completedToday ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.06)'), border: day === last7[6] ? `1px solid ${habit.completedToday ? habit.color : 'rgba(255,255,255,0.15)'}` : 'none' }} />
                      <span className="text-[8px] text-gray-600">
                        {new Date(day + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'narrow' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {state.habits.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-8 text-center"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}>
            <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4"
              style={{ background: 'rgba(251,146,60,0.1)' }}>
              <Flame size={26} className="text-orange-400" />
            </div>
            <p className="text-white font-semibold text-base">Build the habits that build the business.</p>
            <p className="text-gray-500 text-sm mt-1.5 leading-relaxed max-w-xs mx-auto">
              Daily consistency compounds over time. Add your first habit and start your streak today.
            </p>
            <Button onClick={() => setShowAdd(true)} className="mt-5 flex items-center gap-2 mx-auto" size="md">
              <Plus size={15} /> Add First Habit
            </Button>
          </motion.div>
        )}
      </div>

      {/* Add Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="New Habit">
        <div className="space-y-4">
          <Input label="Habit Name" placeholder="e.g. Cold Outreach (20 contacts)" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <Select label="Frequency" value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </Select>

          <div>
            <label className="block text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map(icon => (
                <button key={icon} onClick={() => setForm(f => ({ ...f, icon }))}
                  className="w-10 h-10 rounded-xl text-lg transition-all"
                  style={{ background: form.icon === icon ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)', border: form.icon === icon ? '1px solid rgba(59,130,246,0.5)' : '1px solid transparent' }}>
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Color</label>
            <div className="flex gap-2">
              {COLORS.map(color => (
                <button key={color} onClick={() => setForm(f => ({ ...f, color }))}
                  className="w-8 h-8 rounded-full transition-all"
                  style={{ background: color, border: form.color === color ? '2px solid white' : '2px solid transparent', transform: form.color === color ? 'scale(1.2)' : 'scale(1)' }} />
              ))}
            </div>
          </div>

          <Button onClick={submit} disabled={!form.name} className="w-full">Add Habit</Button>
        </div>
      </Modal>
    </div>
  );
}
