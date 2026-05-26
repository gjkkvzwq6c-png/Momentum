import { useState, useCallback, useEffect } from 'react';
import type { AppState, MacroGoal, MicroGoal, Habit, Strategy, DayEntry, FocusSession, UserSettings } from '../types';
import { createInitialState } from '../data/initialData';

const STORAGE_KEY = 'momentum_os_v2';

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return createInitialState();
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

let listeners: Array<() => void> = [];
let globalState: AppState = loadState();

function notify() {
  listeners.forEach(l => l());
  saveState(globalState);
}

export function useStore() {
  const [, forceRender] = useState(0);

  useEffect(() => {
    const listener = () => forceRender(n => n + 1);
    listeners.push(listener);
    return () => { listeners = listeners.filter(l => l !== listener); };
  }, []);

  const updateUser = useCallback((updates: Partial<UserSettings>) => {
    globalState = { ...globalState, user: { ...globalState.user, ...updates } };
    notify();
  }, []);

  const addMacroGoal = useCallback((goal: MacroGoal) => {
    globalState = { ...globalState, macroGoals: [...globalState.macroGoals, goal] };
    checkBadges();
    notify();
  }, []);

  const updateMacroGoal = useCallback((id: string, updates: Partial<MacroGoal>) => {
    globalState = {
      ...globalState,
      macroGoals: globalState.macroGoals.map(g => g.id === id ? { ...g, ...updates } : g),
    };
    notify();
  }, []);

  const deleteMacroGoal = useCallback((id: string) => {
    globalState = { ...globalState, macroGoals: globalState.macroGoals.filter(g => g.id !== id) };
    notify();
  }, []);

  const addMicroGoal = useCallback((macroId: string, micro: MicroGoal) => {
    globalState = {
      ...globalState,
      macroGoals: globalState.macroGoals.map(g => {
        if (g.id !== macroId) return g;
        const microGoals = [...g.microGoals, micro];
        const progress = calcMacroProgress(microGoals);
        return { ...g, microGoals, progress };
      }),
    };
    notify();
  }, []);

  const updateMicroGoal = useCallback((macroId: string, microId: string, updates: Partial<MicroGoal>) => {
    globalState = {
      ...globalState,
      macroGoals: globalState.macroGoals.map(g => {
        if (g.id !== macroId) return g;
        const microGoals = g.microGoals.map(m => m.id === microId ? { ...m, ...updates } : m);
        const progress = calcMacroProgress(microGoals);
        const status = progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : g.status;
        if (status === 'completed' && g.status !== 'completed') {
          addScore(100);
          unlockBadge('b9');
        }
        return { ...g, microGoals, progress, status };
      }),
    };
    checkBadges();
    notify();
  }, []);

  const deleteMicroGoal = useCallback((macroId: string, microId: string) => {
    globalState = {
      ...globalState,
      macroGoals: globalState.macroGoals.map(g => {
        if (g.id !== macroId) return g;
        const microGoals = g.microGoals.filter(m => m.id !== microId);
        return { ...g, microGoals, progress: calcMacroProgress(microGoals) };
      }),
    };
    notify();
  }, []);

  const addHabit = useCallback((habit: Habit) => {
    globalState = { ...globalState, habits: [...globalState.habits, habit] };
    notify();
  }, []);

  const updateHabit = useCallback((id: string, updates: Partial<Habit>) => {
    globalState = {
      ...globalState,
      habits: globalState.habits.map(h => h.id === id ? { ...h, ...updates } : h),
    };
    notify();
  }, []);

  const deleteHabit = useCallback((id: string) => {
    globalState = { ...globalState, habits: globalState.habits.filter(h => h.id !== id) };
    notify();
  }, []);

  const completeHabit = useCallback((id: string): boolean => {
    const today = new Date().toISOString().split('T')[0];
    let newBadge = false;
    globalState = {
      ...globalState,
      habits: globalState.habits.map(h => {
        if (h.id !== id || h.completedToday) return h;
        const streak = h.streak + 1;
        const bestStreak = Math.max(streak, h.bestStreak);
        return {
          ...h,
          completedToday: true,
          streak,
          bestStreak,
          completionHistory: { ...h.completionHistory, [today]: true },
        };
      }),
    };
    addScore(15);
    checkBadges();
    notify();
    return newBadge;
  }, []);

  const addStrategy = useCallback((strategy: Strategy) => {
    globalState = { ...globalState, strategies: [...globalState.strategies, strategy] };
    checkBadges();
    notify();
  }, []);

  const updateStrategy = useCallback((id: string, updates: Partial<Strategy>) => {
    globalState = {
      ...globalState,
      strategies: globalState.strategies.map(s => s.id === id ? { ...s, ...updates } : s),
    };
    notify();
  }, []);

  const deleteStrategy = useCallback((id: string) => {
    globalState = { ...globalState, strategies: globalState.strategies.filter(s => s.id !== id) };
    notify();
  }, []);

  const upsertDayEntry = useCallback((date: string, updates: Partial<DayEntry>) => {
    const existing = globalState.dayEntries[date] || {
      date, momentumScore: 0, habitsCompleted: [], microGoalsCompleted: [],
      revenue: 0, win: '', lesson: '', notes: '', mood: 3, focusMinutes: 0,
    };
    globalState = {
      ...globalState,
      dayEntries: { ...globalState.dayEntries, [date]: { ...existing, ...updates } },
    };
    notify();
  }, []);

  const submitCheckIn = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    addScore(25);
    globalState = { ...globalState, lastCheckIn: today };
    upsertDayEntry(today, { momentumScore: globalState.momentumScore });
    checkBadges();
    notify();
  }, []);

  const addFocusSession = useCallback((session: FocusSession) => {
    globalState = { ...globalState, focusSessions: [...globalState.focusSessions, session] };
    addScore(20);
    checkBadges();
    notify();
  }, []);

  const resetData = useCallback(() => {
    globalState = createInitialState();
    notify();
  }, []);

  return {
    state: globalState,
    updateUser,
    addMacroGoal,
    updateMacroGoal,
    deleteMacroGoal,
    addMicroGoal,
    updateMicroGoal,
    deleteMicroGoal,
    addHabit,
    updateHabit,
    deleteHabit,
    completeHabit,
    addStrategy,
    updateStrategy,
    deleteStrategy,
    upsertDayEntry,
    submitCheckIn,
    addFocusSession,
    resetData,
  };
}

function calcMacroProgress(microGoals: MicroGoal[]): number {
  if (!microGoals.length) return 0;
  const total = microGoals.reduce((sum, m) => sum + m.contributionWeight, 0);
  if (total === 0) {
    const completed = microGoals.filter(m => m.status === 'completed').length;
    return Math.round((completed / microGoals.length) * 100);
  }
  const done = microGoals.reduce((sum, m) => {
    const pct = m.status === 'completed' ? 1 : m.progress / 100;
    return sum + (m.contributionWeight * pct);
  }, 0);
  return Math.min(100, Math.round((done / total) * 100));
}

function addScore(pts: number) {
  globalState = { ...globalState, momentumScore: Math.min(1000, globalState.momentumScore + pts) };
}

function unlockBadge(id: string) {
  const badge = globalState.badges.find(b => b.id === id);
  if (badge && !badge.unlocked) {
    globalState = {
      ...globalState,
      badges: globalState.badges.map(b => b.id === id
        ? { ...b, unlocked: true, unlockedAt: new Date().toISOString() }
        : b
      ),
    };
  }
}

function checkBadges() {
  const s = globalState;
  const completedMicros = s.macroGoals.flatMap(g => g.microGoals).filter(m => m.status === 'completed').length;
  const totalHabits = Object.values(s.habits.reduce((acc, h) => {
    Object.values(h.completionHistory).forEach(v => { if (v) acc[h.id] = (acc[h.id] || 0) + 1; });
    return acc;
  }, {} as Record<string, number>)).reduce((a, b) => a + b, 0);
  const maxStreak = Math.max(0, ...s.habits.map(h => h.streak));

  if (s.macroGoals.length >= 1) unlockBadge('b1');
  if (completedMicros >= 5) unlockBadge('b2');
  if (maxStreak >= 7) unlockBadge('b3');
  if (completedMicros >= 25) unlockBadge('b4');
  if (maxStreak >= 30) unlockBadge('b5');
  if (s.focusSessions.length >= 10) unlockBadge('b6');
  if (s.strategies.length >= 10) unlockBadge('b7');
  if (totalHabits >= 100) unlockBadge('b8');

  // Update progress on badges
  globalState = {
    ...globalState,
    badges: globalState.badges.map(b => {
      switch (b.id) {
        case 'b1': return { ...b, progress: Math.min(1, s.macroGoals.length) };
        case 'b2': return { ...b, progress: completedMicros };
        case 'b3': return { ...b, progress: maxStreak };
        case 'b4': return { ...b, progress: completedMicros };
        case 'b5': return { ...b, progress: maxStreak };
        case 'b6': return { ...b, progress: s.focusSessions.length };
        case 'b7': return { ...b, progress: s.strategies.length };
        case 'b8': return { ...b, progress: totalHabits };
        default: return b;
      }
    }),
  };
}
