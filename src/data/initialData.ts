import type { AppState, Badge } from '../types';

export const ALL_BADGES: Badge[] = [
  { id: 'b1', name: 'First Step', description: 'Created your first goal', rarity: 'common', icon: '🎯', unlocked: false, progress: 0, target: 1 },
  { id: 'b2', name: 'Momentum Builder', description: 'Complete 5 micro goals', rarity: 'common', icon: '⚡', unlocked: false, progress: 0, target: 5 },
  { id: 'b3', name: 'Streak Starter', description: 'Maintain a 7-day habit streak', rarity: 'common', icon: '🔥', unlocked: false, progress: 0, target: 7 },
  { id: 'b4', name: 'Closer', description: 'Complete 25 micro goals', rarity: 'rare', icon: '🤝', unlocked: false, progress: 0, target: 25 },
  { id: 'b5', name: 'Relentless', description: 'Maintain a 30-day habit streak', rarity: 'rare', icon: '💪', unlocked: false, progress: 0, target: 30 },
  { id: 'b6', name: 'Deep Work Beast', description: 'Complete 10 focus sessions', rarity: 'rare', icon: '🧠', unlocked: false, progress: 0, target: 10 },
  { id: 'b7', name: 'Strategy Master', description: 'Store 10 strategies in the vault', rarity: 'epic', icon: '♟️', unlocked: false, progress: 0, target: 10 },
  { id: 'b8', name: 'Consistency King', description: 'Complete 100 total habits', rarity: 'epic', icon: '👑', unlocked: false, progress: 0, target: 100 },
  { id: 'b9', name: 'Yearly Visionary', description: 'Complete a full Macro Goal', rarity: 'epic', icon: '🌟', unlocked: false, progress: 0, target: 1 },
  { id: 'b10', name: 'Perfect Day', description: 'Complete all habits and daily check-in on the same day', rarity: 'legendary', icon: '💎', unlocked: false, progress: 0, target: 1 },
  { id: 'b11', name: 'First $10k Month', description: 'Log $10,000+ in a single month\'s revenue', rarity: 'legendary', icon: '💰', unlocked: false, progress: 0, target: 10000 },
];

export const createInitialState = (): AppState => ({
  user: {
    name: '',
    businessName: '',
    theme: 'dark',
    motivationalTone: 'aggressive',
    onboardingComplete: false,
    onboardingAnswers: {
      name: '',
      businessType: '',
      biggestGoal: '',
      habitsToAdd: '',
      successDefinition: '',
    },
  },
  momentumScore: 0,
  lastCheckIn: undefined,
  macroGoals: [],
  habits: [],
  strategies: [],
  dayEntries: {},
  badges: ALL_BADGES,
  focusSessions: [],
});
