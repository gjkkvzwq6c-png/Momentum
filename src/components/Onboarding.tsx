import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Zap } from 'lucide-react';
import { Input } from './shared/Input';
import Button from './shared/Button';
import { useStore } from '../store/useStore';

const steps = [
  { q: "What's your name?", field: 'name', placeholder: 'e.g. Alex Rivera', type: 'text' },
  { q: "What type of business are you building?", field: 'businessType', placeholder: 'e.g. SaaS, Agency, E-commerce, Consulting...', type: 'text' },
  { q: "What is your biggest goal this year?", field: 'biggestGoal', placeholder: 'e.g. Hit $500k revenue, build a 10-person team...', type: 'text' },
  { q: "What habits do you want to build?", field: 'habitsToAdd', placeholder: 'e.g. Daily outreach, deep work, exercise, content creation...', type: 'text' },
  { q: "What does success look like for you?", field: 'successDefinition', placeholder: 'e.g. Financial freedom, impact, a business that runs without me...', type: 'text' },
];

export default function Onboarding() {
  const { updateUser } = useStore();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    name: '',
    businessType: '',
    biggestGoal: '',
    habitsToAdd: '',
    successDefinition: '',
  });

  const current = steps[step];

  const next = () => {
    if (step < steps.length - 1) {
      setStep(s => s + 1);
    } else {
      updateUser({
        name: answers.name,
        businessName: answers.businessType,
        onboardingComplete: true,
        onboardingAnswers: answers,
      });
    }
  };

  const canContinue = answers[current.field as keyof typeof answers].trim().length > 0;

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.12) 0%, #0a0a0f 60%)' }}>
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-gradient">Momentum OS</span>
          </div>
          <p className="text-gray-400 text-sm">Your premium goal-crushing command center</p>
        </motion.div>

        <div className="flex gap-1.5 mb-10 justify-center">
          {steps.map((_, i) => (
            <div key={i} className="h-1 rounded-full transition-all duration-500"
              style={{ width: i <= step ? 32 : 20, background: i <= step ? '#3b82f6' : 'rgba(255,255,255,0.1)' }} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            <div className="glass rounded-2xl p-8" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <p className="text-xs text-blue-400 font-semibold uppercase tracking-widest mb-3">
                Step {step + 1} of {steps.length}
              </p>
              <h2 className="text-2xl font-bold text-white mb-6">{current.q}</h2>
              <Input
                placeholder={current.placeholder}
                value={answers[current.field as keyof typeof answers]}
                onChange={e => setAnswers(a => ({ ...a, [current.field]: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && canContinue && next()}
                autoFocus
              />
            </div>
          </motion.div>
        </AnimatePresence>

        <motion.div className="mt-6 flex justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Button onClick={next} disabled={!canContinue} size="lg" className="flex items-center gap-2">
            {step < steps.length - 1 ? 'Continue' : "Let's Go"}
            <ChevronRight size={18} />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
