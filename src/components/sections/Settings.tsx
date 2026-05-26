import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Palette, RefreshCw, Download, MessageSquare, AlertTriangle } from 'lucide-react';
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
      className="glass rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)' }}>
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

      <Section icon={<MessageSquare size={16} />} title="Motivational Tone">
        <Select label="Communication Style" value={tone} onChange={e => setTone(e.target.value as any)}>
          <option value="aggressive">Aggressive — No excuses, no mercy</option>
          <option value="balanced">Balanced — Firm but supportive</option>
          <option value="gentle">Gentle — Encouraging and kind</option>
        </Select>
      </Section>

      <Section icon={<Palette size={16} />} title="Display">
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm text-white font-medium">Dark Mode</p>
            <p className="text-xs text-gray-500">Always enabled for optimal focus</p>
          </div>
          <div className="w-12 h-6 rounded-full bg-blue-600 flex items-center justify-end px-1">
            <div className="w-4 h-4 rounded-full bg-white" />
          </div>
        </div>
      </Section>

      <div className="flex gap-2">
        <Button onClick={save} className="flex-1">
          {saved ? '✓ Saved!' : 'Save Changes'}
        </Button>
      </div>

      <Section icon={<Download size={16} />} title="Data & Privacy">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white font-medium">Export Progress</p>
              <p className="text-xs text-gray-500">Download all your data as JSON</p>
            </div>
            <Button onClick={exportData} variant="secondary" size="sm">Export</Button>
          </div>
        </div>
      </Section>

      <Section icon={<RefreshCw size={16} />} title="Reset">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white font-medium">Reset All Data</p>
            <p className="text-xs text-gray-500">Start fresh with demo data</p>
          </div>
          <Button onClick={() => setShowReset(true)} variant="danger" size="sm">Reset</Button>
        </div>
      </Section>

      {/* Onboarding answers preview */}
      {state.user.onboardingAnswers.biggestGoal && (
        <Section icon={<User size={16} />} title="Your Vision">
          <div className="space-y-2.5">
            {[
              { label: 'Business Type', value: state.user.onboardingAnswers.businessType },
              { label: 'Biggest Goal', value: state.user.onboardingAnswers.biggestGoal },
              { label: 'Success Vision', value: state.user.onboardingAnswers.successDefinition },
            ].filter(i => i.value).map(item => (
              <div key={item.label} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">{item.label}</p>
                <p className="text-sm text-gray-300 mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      <div className="text-center py-4">
        <p className="text-xs text-gray-600">Momentum OS · Built for champions</p>
        <p className="text-xs text-gray-700 mt-0.5">All data stored locally on your device</p>
      </div>

      {/* Reset Confirm Modal */}
      <Modal open={showReset} onClose={() => setShowReset(false)} title="Reset Data">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)' }}>
            <AlertTriangle size={28} className="text-red-400" />
          </div>
          <div>
            <p className="text-white font-semibold">Are you sure?</p>
            <p className="text-sm text-gray-400 mt-1">This will clear all your goals, habits, and progress. Demo data will be restored.</p>
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
