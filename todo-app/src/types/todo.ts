export interface TodoGroup {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: Date;
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority?: 'low' | 'medium' | 'high';
  groupId?: string;
  dueDate?: Date;
  createdAt: Date;
  completedAt?: Date;
}

export interface TodoFilter {
  groupId?: string;
  completed?: boolean;
  priority?: Todo['priority'];
  dueBefore?: Date;
  dueAfter?: Date;
}

export interface TodoStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}

export interface AppSettings {
  language: 'en' | 'de';
  darkMode: boolean;
  themeMode?: 'light' | 'dark' | 'system';
  notifications: {
    enabled: boolean;
    dailyReminder: boolean;
    reminderTime: {
      hour: number;
      minute: number;
    };
  };
  celebrationAnimations: boolean;
}