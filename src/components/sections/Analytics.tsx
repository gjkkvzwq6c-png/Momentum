import { motion } from 'framer-motion';
import { BarChart2, TrendingUp, Target, Repeat2, Focus, Award } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-strong rounded-xl px-3 py-2" style={{ background: 'var(--bg-modal)', border: '1px solid var(--border-modal)' }}>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-bold text-white">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000);
    return { date: d.toISOString().split('T')[0], label: d.toLocaleDateString('en-US', { weekday: 'short' }) };
  });
}


export default function Analytics() {
  const { state } = useStore();
  const last7 = getLast7Days();

  // Habit completion last 7 days
  const habitData = last7.map(({ date, label }) => ({
    label,
    value: state.habits.filter(h => h.completionHistory[date]).length,
  }));

  // Revenue last 7 days
  const revenueData = last7.map(({ date, label }) => ({
    label,
    value: state.dayEntries[date]?.revenue || 0,
  }));

  // Focus minutes last 7 days
  const focusData = last7.map(({ date, label }) => ({
    label,
    value: state.dayEntries[date]?.focusMinutes || 0,
  }));

  // Macro Goal progress
  const goalData = state.macroGoals.slice(0, 5).map(g => ({
    label: g.title.length > 15 ? g.title.slice(0, 15) + '…' : g.title,
    value: g.progress,
  }));

  // Stats cards
  const totalHabitsCompleted = state.habits.reduce((sum, h) =>
    sum + Object.values(h.completionHistory).filter(Boolean).length, 0);
  const avgStreak = state.habits.length > 0
    ? Math.round(state.habits.reduce((s, h) => s + h.streak, 0) / state.habits.length) : 0;
  const completedMicros = state.macroGoals.flatMap(g => g.microGoals).filter(m => m.status === 'completed').length;
  const totalMicros = state.macroGoals.flatMap(g => g.microGoals).length;
  const totalFocusHrs = Math.round(state.focusSessions.reduce((s, f) => s + f.duration, 0) / 60 * 10) / 10;
  const stats = [
    { label: 'Momentum Score', value: state.momentumScore, icon: <BarChart2 size={16} />, color: '#3b82f6', unit: '/1000' },
    { label: 'Total Habits Done', value: totalHabitsCompleted, icon: <Repeat2 size={16} />, color: '#10b981', unit: '' },
    { label: 'Avg Streak', value: avgStreak, icon: <TrendingUp size={16} />, color: '#f59e0b', unit: 'd' },
    { label: 'Goals Progress', value: `${completedMicros}/${totalMicros}`, icon: <Target size={16} />, color: '#8b5cf6', unit: '' },
    { label: 'Focus Hours', value: totalFocusHrs, icon: <Focus size={16} />, color: '#ec4899', unit: 'h' },
    { label: 'Badges Earned', value: state.badges.filter(b => b.unlocked).length, icon: <Award size={16} />, color: '#f59e0b', unit: '' },
  ];

  return (
    <div className="space-y-4 pb-2">
      <div>
        <h2 className="text-xl font-bold text-white">Analytics</h2>
        <p className="text-xs text-gray-500 mt-0.5">Your performance at a glance</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass rounded-2xl p-4" style={{ background: 'var(--bg-card)' }}>
            <div className="flex items-center gap-2 mb-2" style={{ color: stat.color }}>
              {stat.icon}
              <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}<span className="text-sm text-gray-500">{stat.unit}</span></p>
          </motion.div>
        ))}
      </div>

      {/* Empty state — no activity yet */}
      {state.habits.length === 0 && state.macroGoals.length === 0 && state.focusSessions.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 text-center"
          style={{ background: 'var(--bg-card-empty)', border: '1px dashed rgba(255,255,255,0.08)' }}>
          <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-3"
            style={{ background: 'rgba(59,130,246,0.1)' }}>
            <BarChart2 size={22} className="text-blue-400" />
          </div>
          <p className="text-white font-semibold">No data yet.</p>
          <p className="text-gray-500 text-sm mt-1.5 leading-relaxed max-w-xs mx-auto">
            Your analytics will appear here as you complete habits, goals, and focus sessions. Start building your streak today.
          </p>
        </motion.div>
      )}

      {/* Habit Consistency Chart */}
      {state.habits.length > 0 && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="glass rounded-2xl p-4" style={{ background: 'var(--bg-card)' }}>
        <h3 className="text-sm font-semibold text-white mb-4">Habit Consistency (7 days)</h3>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={habitData} barSize={24}>
            <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {habitData.map((_, i) => (
                <Cell key={i} fill={i === 6 ? '#3b82f6' : 'rgba(59,130,246,0.4)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>}

      {/* Revenue Chart */}
      {revenueData.some(d => d.value > 0) && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="glass rounded-2xl p-4" style={{ background: 'var(--bg-card)' }}>
          <h3 className="text-sm font-semibold text-white mb-4">Revenue Trend (7 days)</h3>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="value" stroke="#10b981" fill="url(#revGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Goal Progress */}
      {goalData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-4" style={{ background: 'var(--bg-card)' }}>
          <h3 className="text-sm font-semibold text-white mb-4">Goal Progress</h3>
          <div className="space-y-3">
            {goalData.map(g => (
              <div key={g.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-300">{g.label}</span>
                  <span className="text-blue-400 font-bold">{g.value}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <motion.div className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }}
                    initial={{ width: 0 }} animate={{ width: `${g.value}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Focus Sessions */}
      {focusData.some(d => d.value > 0) && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="glass rounded-2xl p-4" style={{ background: 'var(--bg-card)' }}>
          <h3 className="text-sm font-semibold text-white mb-4">Focus Minutes (7 days)</h3>
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={focusData} barSize={20}>
              <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="rgba(139,92,246,0.6)" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  );
}
