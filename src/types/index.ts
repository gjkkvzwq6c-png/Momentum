export type GoalStatus = 'not_started' | 'in_progress' | 'completed';
export type Priority = 'low' | 'medium' | 'high';
export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type NavSection =
  | 'dashboard'
  | 'goals'
  | 'habits'
  | 'strategy'
  | 'planner'
  | 'badges'
  | 'analytics'
  | 'focus'
  | 'settings';

export interface MicroGoal {
  id: string;
  macroGoalId: string;
  title: string;
  dueDate: string;
  status: GoalStatus;
  priority: Priority;
  progress: number;
  actionSteps: string[];
  notes: string;
  contributionWeight: number;
  createdAt: string;
  completedAt?: string;
}

export interface MacroGoal {
  id: string;
  title: string;
  deadline: string;
  category: string;
  progress: number;
  status: GoalStatus;
  priority: Priority;
  linkedHabits: string[];
  linkedStrategies: string[];
  notes: string;
  microGoals: MicroGoal[];
  createdAt: string;
  completedAt?: string;
}

export interface Habit {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly';
  streak: number;
  bestStreak: number;
  completedToday: boolean;
  completionHistory: Record<string, boolean>;
  linkedMacroGoalId?: string;
  reminderTime?: string;
  createdAt: string;
  color: string;
  icon: string;
}

export interface Strategy {
  id: string;
  title: string;
  category: string;
  notes: string;
  linkedMacroGoalId?: string;
  tags: string[];
  createdAt: string;
  isFavorite: boolean;
}

export interface DayEntry {
  date: string;
  momentumScore: number;
  habitsCompleted: string[];
  microGoalsCompleted: string[];
  revenue: number;
  win: string;
  lesson: string;
  notes: string;
  mood: number;
  focusMinutes: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  rarity: BadgeRarity;
  icon: string;
  unlockedAt?: string;
  unlocked: boolean;
  progress?: number;
  target?: number;
}

export interface FocusSession {
  id: string;
  goal: string;
  notes: string;
  duration: number;
  completedAt: string;
}

export interface UserSettings {
  name: string;
  businessName: string;
  theme: 'dark' | 'light';
  motivationalTone: 'aggressive' | 'balanced' | 'gentle';
  onboardingComplete: boolean;
  onboardingAnswers: {
    name: string;
    businessType: string;
    biggestGoal: string;
    habitsToAdd: string;
    successDefinition: string;
  };
}

export interface AppState {
  user: UserSettings;
  macroGoals: MacroGoal[];
  habits: Habit[];
  strategies: Strategy[];
  dayEntries: Record<string, DayEntry>;
  badges: Badge[];
  focusSessions: FocusSession[];
  momentumScore: number;
  lastCheckIn?: string;
}
