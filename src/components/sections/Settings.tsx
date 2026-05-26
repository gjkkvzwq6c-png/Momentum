import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Palette, RefreshCw, Download, MessageSquare, AlertTriangle, Sun, Moon } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Input, Select } from '../shared/Input';
import Button from '../shared/Button';
import Modal from '../shared/Modal';

export default function Settings() {
  const { state, updateUser, resetData } = useStore();
  const [name, setName] = useState(state.user.name);
  const [bizName, setBizName] = useState(state.user.businessName);
  const [tone, setTone] = useState(state.user.motivationalTone);
  const [saved, setSaved] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const isDark = state.user.theme !== 'light';

  const toggleTheme = () => {
    updateUser({ theme: isDark ? 'light' : 'dark' });
  };

  const save = () => {
    updateUser({ name, businessName: bizName, motivationalTone: tone as any });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const exportData = () => {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `momentum-os-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const Section = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-blue-400">{icon}</span>
        <h3 className="font-semibold text-sm text-white">{title}</h3>
      </div>
      {children}
    </motion.div>
  );

  return (
    <div className="space-y-4 pb-2">
      <div>
        <h2 className="text-xl font-bold text-white">Settings</h2>
        <p className="text-xs text-gray-500 mt-0.5">Customize your experience</p>
      </div>

      <Section icon={<User size={16} />} title="Profile">
        <div className="space-y-3">
          <Input label="Your Name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
          <Input label="Business Name" value={bizName} onChange={e => setBizName(e.target.value)} placeholder="Your business or venture" />
        </div>
      </Section>

      <Section icon={<Palette size={16} />} title="Appearance">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between py-2 px-1 rounded-xl transition-all"
          style={{ cursor: 'pointer' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: isDark ? 'rgba(139,92,246,0.15)' : 'rgba(251,191,36,0.15)' }}>
              {isDark
                ? <Moon size={16} className="text-purple-400" />
                : <Sun size={16} className="text-yellow-400" />}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-white">{isDark ? 'Dark Mode' : 'Light Mode'}</p>
              <p className="text-xs text-gray-500">{isDark ? 'Easy on the eyes at night' : 'Crisp and clean for daytime'}</p>
            </div>
          </div>
          {/* Toggle pill */}
          <motion.div
            layout
            className="relative flex items-center rounded-full shrink-0"
            style={{
              width: 48,
              height: 28,
              background: isDark ? '#3b82f6' : '#e2e8f0',
              padding: 3,
            }}
          >
            <motion.div
              layout
              animate={{ x: isDark ? 20 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              className="w-5 h-5 rounded-full bg-white shadow-sm"
            />
          </motion.div>
        </button>
      </Section>

      <Section icon={<MessageSquare size={16} />} title="Motivational Tone">
        <Select label="Communication Style" value={tone} onChange={e => setTone(e.target.value as any)}>
          <option value="aggressive">Aggressive — No excuses, no mercy</option>
          <option value="balanced">Balanced — Firm but supportive</option>
          <option value="gentle">Gentle — Encouraging and kind</option>
        </Select>
      </Section>

      <Button onClick={save} className="w-full">
        {saved ? '✓ Saved!' : 'Save Changes'}
      </Button>

      <Section icon={<Download size={16} />} title="Data & Privacy">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white font-medium">Export Progress</p>
            <p className="text-xs text-gray-500">Download all your data as JSON</p>
          </div>
          <Button onClick={exportData} variant="secondary" size="sm">Export</Button>
        </div>
      </Section>

      <Section icon={<RefreshCw size={16} />} title="Reset">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white font-medium">Reset All Data</p>
            <p className="text-xs text-gray-500">Clear all goals, habits, and progress</p>
          </div>
          <Button onClick={() => setShowReset(true)} variant="danger" size="sm">Reset</Button>
        </div>
      </Section>

      {state.user.onboardingAnswers.biggestGoal && (
        <Section icon={<User size={16} />} title="Your Vision">
          <div className="space-y-2.5">
            {[
              { label: 'Business Type', value: state.user.onboardingAnswers.businessType },
              { label: 'Biggest Goal', value: state.user.onboardingAnswers.biggestGoal },
              { label: 'Success Vision', value: state.user.onboardingAnswers.successDefinition },
            ].filter(i => i.value).map(item => (
              <div key={item.label} className="p-3 rounded-xl" style={{ background: 'var(--bg-card-inner)' }}>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">{item.label}</p>
                <p className="text-sm text-gray-300 mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      <div className="text-center py-4">
        <p className="text-xs text-gray-600">Momentum OS · Built for champions</p>
        <p className="text-xs text-gray-600 mt-0.5">All data stored locally on your device</p>
      </div>

      <Modal open={showReset} onClose={() => setShowReset(false)} title="Reset Data">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
            style={{ background: 'rgba(239,68,68,0.1)' }}>
            <AlertTriangle size={28} className="text-red-400" />
          </div>
          <div>
            <p className="text-white font-semibold">Are you sure?</p>
            <p className="text-sm text-gray-400 mt-1">This will clear all your goals, habits, and progress.</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setShowReset(false)} variant="secondary" className="flex-1">Cancel</Button>
            <Button onClick={() => { resetData(); setShowReset(false); }} variant="danger" className="flex-1">Reset Everything</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
