import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, Star } from 'lucide-react';
import { useStore } from '../../store/useStore';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import { Input, Textarea } from '../shared/Input';
import type { DayEntry } from '../../types';

const MONTH_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function dateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getMoodColor(mood: number): string {
  const colors = ['', '#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6'];
  return colors[mood] || '';
}

function getHeatColor(score: number): string {
  if (score === 0) return 'rgba(255,255,255,0.04)';
  if (score < 20) return 'rgba(59,130,246,0.15)';
  if (score < 50) return 'rgba(59,130,246,0.3)';
  if (score < 80) return 'rgba(59,130,246,0.55)';
  return 'rgba(59,130,246,0.8)';
}

export default function YearlyPlanner() {
  const { state, upsertDayEntry } = useStore();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<DayEntry>>({});
  const [saved, setSaved] = useState(false);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = now.toISOString().split('T')[0];

  const openDay = (d: string) => {
    const entry = state.dayEntries[d] || { date: d, momentumScore: 0, habitsCompleted: [], microGoalsCompleted: [], revenue: 0, win: '', lesson: '', notes: '', mood: 3, focusMinutes: 0 };
    setEditForm(entry);
    setSelectedDay(d);
  };

  const saveDay = () => {
    if (!selectedDay) return;
    upsertDayEntry(selectedDay, editForm);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  // Heatmap data - yearly overview
  const heatmapData: Record<string, number> = {};
  Object.entries(state.dayEntries).forEach(([date, entry]) => {
    const habits = entry.habitsCompleted.length;
    const score = Math.min(100, habits * 20 + (entry.win ? 20 : 0) + (entry.focusMinutes > 0 ? 20 : 0));
    heatmapData[date] = score;
  });

  // Calculate current month's revenue
  const monthRevenue = Object.entries(state.dayEntries)
    .filter(([d]) => d.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`))
    .reduce((sum, [, e]) => sum + (e.revenue || 0), 0);

  return (
    <div className="space-y-4 pb-2">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Yearly Planner</h2>
          <p className="text-xs text-gray-500 mt-0.5">{year} · Business Journal</p>
        </div>
      </div>

      {/* Month Navigation */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-4" style={{ background: 'var(--bg-card)' }}>
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-white/10 transition-all">
            <ChevronLeft size={16} className="text-gray-400" />
          </button>
          <div className="text-center">
            <h3 className="font-bold text-white">{MONTH_FULL[month]} {year}</h3>
            {monthRevenue > 0 && (
              <p className="text-xs text-emerald-400 mt-0.5">${monthRevenue.toLocaleString()} revenue logged</p>
            )}
          </div>
          <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-white/10 transition-all">
            <ChevronRight size={16} className="text-gray-400" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="text-center text-[10px] text-gray-600 font-semibold py-1">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const d = dateStr(year, month, i + 1);
            const entry = state.dayEntries[d];
            const isToday = d === today;
            const heat = heatmapData[d] || 0;
            const mood = entry?.mood;

            return (
              <motion.button key={d} whileTap={{ scale: 0.92 }}
                onClick={() => openDay(d)}
                className="aspect-square rounded-lg flex flex-col items-center justify-center relative overflow-hidden transition-all"
                style={{
                  background: isToday ? 'rgba(59,130,246,0.3)' : getHeatColor(heat),
                  border: isToday ? '1px solid rgba(59,130,246,0.6)' : '1px solid transparent',
                }}>
                <span className={`text-[11px] font-semibold ${isToday ? 'text-blue-300' : heat > 0 ? 'text-white' : 'text-gray-600'}`}>
                  {i + 1}
                </span>
                {mood && <div className="w-1.5 h-1.5 rounded-full absolute bottom-0.5" style={{ background: getMoodColor(mood) }} />}
              </motion.button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-3 justify-center">
          <span className="text-[10px] text-gray-600">Less</span>
          {[0, 20, 50, 80, 100].map(v => (
            <div key={v} className="w-3 h-3 rounded-sm" style={{ background: getHeatColor(v) }} />
          ))}
          <span className="text-[10px] text-gray-600">More</span>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Check-Ins', value: Object.keys(state.dayEntries).length, icon: <Calendar size={14} /> },
          { label: 'Active Days', value: Object.values(state.dayEntries).filter(e => e.habitsCompleted.length > 0).length, icon: <Star size={14} /> },
          { label: 'Revenue Days', value: Object.values(state.dayEntries).filter(e => e.revenue > 0).length, icon: <TrendingUp size={14} /> },
        ].map(stat => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-3 text-center" style={{ background: 'var(--bg-card)' }}>
            <div className="flex justify-center mb-1 text-blue-400">{stat.icon}</div>
            <p className="text-xl font-bold text-white">{stat.value}</p>
            <p className="text-[10px] text-gray-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Empty state nudge */}
      {Object.keys(state.dayEntries).length === 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 text-center"
          style={{ background: 'var(--bg-card-empty)', border: '1px dashed rgba(255,255,255,0.08)' }}>
          <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-3"
            style={{ background: 'rgba(59,130,246,0.1)' }}>
            <Calendar size={22} className="text-blue-400" />
          </div>
          <p className="text-white font-semibold">Start tracking today.</p>
          <p className="text-gray-500 text-sm mt-1.5 leading-relaxed max-w-xs mx-auto">
            Your year begins with one entry. Tap any day on the calendar above to log your wins, revenue, and lessons.
          </p>
          <motion.button whileTap={{ scale: 0.97 }}
            onClick={() => openDay(today)}
            className="mt-4 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: '#3b82f6' }}>
            Log Today's Entry
          </motion.button>
        </motion.div>
      )}

      {/* Day Detail Modal */}
      <Modal open={!!selectedDay} onClose={() => setSelectedDay(null)} title={selectedDay ? new Date(selectedDay + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : ''}>
        {selectedDay && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl" style={{ background: 'rgba(59,130,246,0.08)' }}>
                <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-wide">Momentum Score</p>
                <p className="text-2xl font-bold text-white mt-1">{editForm.momentumScore || 0}</p>
              </div>
              <div className="p-3 rounded-xl" style={{ background: 'rgba(16,185,129,0.08)' }}>
                <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wide">Revenue</p>
                <p className="text-2xl font-bold text-white mt-1">${(editForm.revenue || 0).toLocaleString()}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wide">Revenue ($)</label>
              <input type="number" min={0} value={editForm.revenue || ''}
                onChange={e => setEditForm(f => ({ ...f, revenue: +e.target.value }))}
                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50"
                style={{ background: 'var(--bg-input)', borderColor: 'var(--border-input)', color: 'var(--text-1)' }}
                placeholder="0" />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wide">Mood / Energy (1-5)</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => setEditForm(f => ({ ...f, mood: n }))}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                    style={{
                      background: editForm.mood === n ? getMoodColor(n) + '33' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${editForm.mood === n ? getMoodColor(n) : 'transparent'}`,
                      color: editForm.mood === n ? getMoodColor(n) : '#6b7280',
                    }}>
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <Input label="Focus Time (minutes)" type="number" min={0} value={editForm.focusMinutes || ''}
              onChange={e => setEditForm(f => ({ ...f, focusMinutes: +e.target.value }))} placeholder="0" />

            <Textarea label="Win of the Day" placeholder="What was your biggest win?" rows={2}
              value={editForm.win || ''} onChange={e => setEditForm(f => ({ ...f, win: e.target.value }))} />
            <Textarea label="Lesson Learned" placeholder="What did you learn today?" rows={2}
              value={editForm.lesson || ''} onChange={e => setEditForm(f => ({ ...f, lesson: e.target.value }))} />
            <Textarea label="Notes" placeholder="Free notes..." rows={2}
              value={editForm.notes || ''} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} />

            <div className="flex gap-2">
              <Button onClick={saveDay} className="flex-1">
                {saved ? '✓ Saved!' : 'Save Entry'}
              </Button>
              <Button onClick={() => setSelectedDay(null)} variant="secondary" className="flex-1">Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
