import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Target, ChevronRight, ChevronDown, Trash2, Edit2, CheckCircle2, Clock, AlertCircle, Lightbulb } from 'lucide-react';
import { useStore } from '../../store/useStore';
import ProgressBar from '../shared/ProgressBar';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import { Input, Textarea, Select } from '../shared/Input';
import ConfettiEffect from '../shared/ConfettiEffect';
import { uuid } from '../../utils/uuid';
import type { MacroGoal, MicroGoal, GoalStatus, Priority } from '../../types';

const CATEGORIES = ['Revenue', 'Sales', 'Marketing', 'Product', 'Hiring', 'Operations', 'Personal', 'Leadership'];
const NEXT_STEPS: Record<string, string> = {
  Revenue: 'Schedule 3 discovery calls this week to pipeline revenue.',
  Sales: 'Review your top 5 prospects and send personalized follow-ups.',
  Marketing: 'Create one piece of high-value content today.',
  Product: 'Ship one small feature or fix to maintain momentum.',
  Hiring: 'Post on LinkedIn and reach out to 3 potential candidates.',
  Operations: 'Document one process to reduce bottlenecks.',
  Personal: 'Block 2 hours tomorrow for focused personal development.',
  Leadership: 'Have a 1-on-1 with a team member to understand blockers.',
};

const statusColors: Record<GoalStatus, string> = {
  not_started: '#6b7280',
  in_progress: '#3b82f6',
  completed: '#10b981',
};

const statusLabels: Record<GoalStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
};

function daysLeft(date: string) {
  const diff = new Date(date).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

export default function Goals() {
  const { state, addMacroGoal, deleteMacroGoal, addMicroGoal, updateMicroGoal, deleteMicroGoal } = useStore();
  const [expanded, setExpanded] = useState<string | null>(state.macroGoals[0]?.id || null);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddMicro, setShowAddMicro] = useState<string | null>(null);
  const [showEditGoal, setShowEditGoal] = useState<MacroGoal | null>(null);
  const [confetti, setConfetti] = useState(false);

  const [goalForm, setGoalForm] = useState({ title: '', deadline: '', category: 'Revenue', priority: 'high' as Priority, notes: '' });
  const [microForm, setMicroForm] = useState({ title: '', dueDate: '', priority: 'high' as Priority, notes: '', contributionWeight: 25 });

  const celebrate = () => { setConfetti(true); setTimeout(() => setConfetti(false), 100); };

  const submitGoal = () => {
    const goal: MacroGoal = {
      id: uuid(), title: goalForm.title, deadline: goalForm.deadline,
      category: goalForm.category, progress: 0, status: 'not_started',
      priority: goalForm.priority, linkedHabits: [], linkedStrategies: [],
      notes: goalForm.notes, microGoals: [], createdAt: new Date().toISOString(),
    };
    addMacroGoal(goal);
    setShowAddGoal(false);
    setGoalForm({ title: '', deadline: '', category: 'Revenue', priority: 'high', notes: '' });
  };

  const submitMicro = (macroId: string) => {
    const micro: MicroGoal = {
      id: uuid(), macroGoalId: macroId, title: microForm.title,
      dueDate: microForm.dueDate, status: 'not_started', priority: microForm.priority,
      progress: 0, actionSteps: [], notes: microForm.notes,
      contributionWeight: microForm.contributionWeight, createdAt: new Date().toISOString(),
    };
    addMicroGoal(macroId, micro);
    setShowAddMicro(null);
    setMicroForm({ title: '', dueDate: '', priority: 'high', notes: '', contributionWeight: 25 });
  };

  const toggleMicro = (macroId: string, micro: MicroGoal) => {
    const newStatus: GoalStatus = micro.status === 'completed' ? 'in_progress' : 'completed';
    updateMicroGoal(macroId, micro.id, {
      status: newStatus,
      progress: newStatus === 'completed' ? 100 : 50,
      completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
    });
    if (newStatus === 'completed') celebrate();
  };

  return (
    <div className="space-y-4 pb-2">
      <ConfettiEffect trigger={confetti} />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Macro Goals</h2>
          <p className="text-xs text-gray-500 mt-0.5">{state.macroGoals.length} goals · {state.macroGoals.filter(g => g.status === 'completed').length} completed</p>
        </div>
        <Button onClick={() => setShowAddGoal(true)} size="sm" className="flex items-center gap-1.5">
          <Plus size={14} /> New Goal
        </Button>
      </div>

      <div className="space-y-3">
        {state.macroGoals.map(goal => {
          const isOpen = expanded === goal.id;
          const days = daysLeft(goal.deadline);
          const completedMicros = goal.microGoals.filter(m => m.status === 'completed').length;

          return (
            <motion.div key={goal.id} layout className="glass rounded-2xl overflow-hidden"
              style={{ background: 'var(--bg-card-alt)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {/* Goal Header */}
              <div className="p-4 cursor-pointer" onClick={() => setExpanded(isOpen ? null : goal.id)}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: `${statusColors[goal.status]}20` }}>
                    <Target size={16} style={{ color: statusColors[goal.status] }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-white text-sm leading-tight">{goal.title}</h3>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: `${statusColors[goal.status]}20`, color: statusColors[goal.status] }}>
                          {statusLabels[goal.status]}
                        </span>
                        {isOpen ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronRight size={14} className="text-gray-500" />}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                      <span>{goal.category}</span>
                      <span>·</span>
                      <span className={days < 30 ? 'text-orange-400' : ''}>{days > 0 ? `${days}d left` : 'Overdue'}</span>
                      <span>·</span>
                      <span>{completedMicros}/{goal.microGoals.length} milestones</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2.5">
                      <ProgressBar value={goal.progress} />
                      <span className="text-xs font-bold text-blue-400 shrink-0">{goal.progress}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                    <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-4">
                      {/* Next Step Suggestion */}
                      <div className="flex gap-2 p-3 rounded-xl" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}>
                        <Lightbulb size={14} className="text-blue-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-wide mb-0.5">Next Recommended Action</p>
                          <p className="text-xs text-gray-300">{NEXT_STEPS[goal.category] || NEXT_STEPS.Revenue}</p>
                        </div>
                      </div>

                      {/* Micro Goals */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Milestones</h4>
                          <button onClick={() => setShowAddMicro(goal.id)} className="text-xs text-blue-400 flex items-center gap-1">
                            <Plus size={12} /> Add
                          </button>
                        </div>
                        <div className="space-y-2">
                          {goal.microGoals.map(micro => (
                            <motion.div key={micro.id} layout
                              className="flex items-start gap-3 p-3 rounded-xl cursor-pointer group"
                              style={{ background: 'var(--bg-card)' }}
                              onClick={() => toggleMicro(goal.id, micro)}>
                              <div className="mt-0.5 shrink-0">
                                {micro.status === 'completed'
                                  ? <CheckCircle2 size={16} className="text-emerald-400" />
                                  : micro.status === 'in_progress'
                                  ? <Clock size={16} className="text-blue-400" />
                                  : <AlertCircle size={16} className="text-gray-500" />
                                }
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${micro.status === 'completed' ? 'text-gray-500 line-through' : 'text-white'}`}>
                                  {micro.title}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                                  <span>Due {new Date(micro.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                  <span>·</span>
                                  <span>{micro.contributionWeight}% weight</span>
                                </div>
                                {micro.progress > 0 && micro.status !== 'completed' && (
                                  <div className="mt-1.5">
                                    <ProgressBar value={micro.progress} height={3} />
                                  </div>
                                )}
                              </div>
                              <button onClick={e => { e.stopPropagation(); deleteMicroGoal(goal.id, micro.id); }}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 transition-all">
                                <Trash2 size={12} className="text-gray-500" />
                              </button>
                            </motion.div>
                          ))}
                          {goal.microGoals.length === 0 && (
                            <p className="text-xs text-gray-600 text-center py-3">No milestones yet. Add one to start tracking progress.</p>
                          )}
                        </div>
                      </div>

                      {/* Notes */}
                      {goal.notes && (
                        <div className="text-xs text-gray-400 p-3 rounded-xl" style={{ background: 'var(--bg-card)' }}>
                          {goal.notes}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button onClick={() => setShowEditGoal(goal)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs text-gray-400 hover:text-white hover:bg-white/8 transition-all">
                          <Edit2 size={12} /> Edit Goal
                        </button>
                        <button onClick={() => deleteMacroGoal(goal.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition-all">
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {state.macroGoals.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-8 text-center"
            style={{ background: 'var(--bg-card-empty)', border: '1px dashed rgba(255,255,255,0.08)' }}>
            <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4"
              style={{ background: 'rgba(59,130,246,0.1)' }}>
              <Target size={26} className="text-blue-400" />
            </div>
            <p className="text-white font-semibold text-base">Your biggest wins start here.</p>
            <p className="text-gray-500 text-sm mt-1.5 leading-relaxed max-w-xs mx-auto">
              Define where you're going. Create your first Macro Goal and break it into milestones you can attack daily.
            </p>
            <Button onClick={() => setShowAddGoal(true)} className="mt-5 flex items-center gap-2 mx-auto" size="md">
              <Plus size={15} /> Create First Goal
            </Button>
          </motion.div>
        )}
      </div>

      {/* Add Goal Modal */}
      <Modal open={showAddGoal} onClose={() => setShowAddGoal(false)} title="New Macro Goal">
        <div className="space-y-4">
          <Input label="Goal Title" placeholder="e.g. Hit $250k annual revenue" value={goalForm.title} onChange={e => setGoalForm(f => ({ ...f, title: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Category" value={goalForm.category} onChange={e => setGoalForm(f => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Select label="Priority" value={goalForm.priority} onChange={e => setGoalForm(f => ({ ...f, priority: e.target.value as Priority }))}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Select>
          </div>
          <Input label="Deadline" type="date" value={goalForm.deadline} onChange={e => setGoalForm(f => ({ ...f, deadline: e.target.value }))} />
          <Textarea label="Notes" placeholder="What does success look like?" rows={3} value={goalForm.notes} onChange={e => setGoalForm(f => ({ ...f, notes: e.target.value }))} />
          <Button onClick={submitGoal} disabled={!goalForm.title || !goalForm.deadline} className="w-full">Create Goal</Button>
        </div>
      </Modal>

      {/* Add Micro Goal Modal */}
      <Modal open={!!showAddMicro} onClose={() => setShowAddMicro(null)} title="Add Milestone">
        <div className="space-y-4">
          <Input label="Milestone Title" placeholder="e.g. Close 5 new accounts this month" value={microForm.title} onChange={e => setMicroForm(f => ({ ...f, title: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Priority" value={microForm.priority} onChange={e => setMicroForm(f => ({ ...f, priority: e.target.value as Priority }))}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Select>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wide">Weight %</label>
              <input type="number" min={1} max={100} value={microForm.contributionWeight}
                onChange={e => setMicroForm(f => ({ ...f, contributionWeight: +e.target.value }))}
                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50"
                style={{ background: 'var(--bg-input)', borderColor: 'var(--border-input)', color: 'var(--text-1)' }} />
            </div>
          </div>
          <Input label="Due Date" type="date" value={microForm.dueDate} onChange={e => setMicroForm(f => ({ ...f, dueDate: e.target.value }))} />
          <Textarea label="Notes" placeholder="Action steps, context..." rows={3} value={microForm.notes} onChange={e => setMicroForm(f => ({ ...f, notes: e.target.value }))} />
          <Button onClick={() => submitMicro(showAddMicro!)} disabled={!microForm.title || !microForm.dueDate} className="w-full">Add Milestone</Button>
        </div>
      </Modal>

      {/* Edit Goal Modal (view-only info for now) */}
      <Modal open={!!showEditGoal} onClose={() => setShowEditGoal(null)} title="Goal Details">
        {showEditGoal && (
          <div className="space-y-3">
            <div className="p-4 rounded-xl text-sm text-gray-300" style={{ background: 'var(--bg-card-inner)' }}>
              <p className="font-bold text-white mb-1">{showEditGoal.title}</p>
              <p className="text-gray-400">{showEditGoal.category} · {showEditGoal.priority} priority</p>
              <p className="text-gray-500 text-xs mt-1">Deadline: {new Date(showEditGoal.deadline).toLocaleDateString()}</p>
              {showEditGoal.notes && <p className="text-gray-400 mt-2">{showEditGoal.notes}</p>}
            </div>
            <Button onClick={() => setShowEditGoal(null)} className="w-full">Close</Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
