import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Todo, TodoGroup, AppSettings } from '../types/todo';
import { logger } from '../utils/logger';

const STORAGE_KEYS = {
  TODOS: '@CircleTodo:todos',
  GROUPS: '@CircleTodo:groups',
  SETTINGS: '@CircleTodo:settings',
} as const;

const DEFAULT_GROUPS: TodoGroup[] = [
  {
    id: 'personal',
    name: 'Personal',
    color: '#2D5016',
    icon: 'account',
    createdAt: new Date(),
  },
  {
    id: 'work',
    name: 'Work',
    color: '#1976D2',
    icon: 'briefcase',
    createdAt: new Date(),
  },
  {
    id: 'shopping',
    name: 'Shopping',
    color: '#388E3C',
    icon: 'shopping',
    createdAt: new Date(),
  },
];

const DEFAULT_SETTINGS: AppSettings = {
  language: 'en',
  darkMode: false,
  themeMode: 'system',
  notifications: {
    enabled: true,
    dailyReminder: false,
    reminderTime: {
      hour: 9,
      minute: 0,
    },
  },
  celebrationAnimations: true,
};

/**
 * Storage service for managing todo data persistence
 * Uses AsyncStorage for local data storage with proper error handling
 */
export class StorageService {
  private static instance: StorageService;

  private constructor() {}

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  /**
   * Initialize storage with default data if needed
   */
  async initializeStorage(): Promise<void> {
    try {
      const existingGroups = await this.getGroups();
      if (existingGroups.length === 0) {
        await this.saveGroups(DEFAULT_GROUPS);
      }

      const existingSettings = await this.getSettings();
      if (!existingSettings) {
        await this.saveSettings(DEFAULT_SETTINGS);
      }
    } catch (error) {
      logger.error('Failed to initialize storage:', error);
    }
  }

  // Todo operations
  async getTodos(): Promise<Todo[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.TODOS);
      if (!data) return [];
      
      const todos = JSON.parse(data);
      return todos.map((todo: any) => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
        dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
        completedAt: todo.completedAt ? new Date(todo.completedAt) : undefined,
      }));
    } catch (error) {
      logger.error('Failed to get todos:', error);
      return [];
    }
  }

  async saveTodos(todos: Todo[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(todos));
    } catch (error) {
      logger.error('Failed to save todos:', error);
      throw error;
    }
  }

  async addTodo(todo: Omit<Todo, 'id' | 'createdAt'>): Promise<Todo> {
    try {
      const newTodo: Todo = {
        ...todo,
        id: Date.now().toString(),
        createdAt: new Date(),
      };

      const todos = await this.getTodos();
      todos.push(newTodo);
      await this.saveTodos(todos);
      
      return newTodo;
    } catch (error) {
      logger.error('Failed to add todo:', error);
      throw error;
    }
  }

  async updateTodo(id: string, updates: Partial<Todo>): Promise<Todo | null> {
    try {
      const todos = await this.getTodos();
      const index = todos.findIndex(todo => todo.id === id);
      
      if (index === -1) return null;

      const updatedTodo: Todo = { ...todos[index], ...updates } as Todo;
      todos[index] = updatedTodo;
      await this.saveTodos(todos);
      
      return updatedTodo;
    } catch (error) {
      logger.error('Failed to update todo:', error);
      throw error;
    }
  }

  async deleteTodo(id: string): Promise<boolean> {
    try {
      const todos = await this.getTodos();
      const filteredTodos = todos.filter(todo => todo.id !== id);
      
      if (filteredTodos.length === todos.length) return false;
      
      await this.saveTodos(filteredTodos);
      return true;
    } catch (error) {
      logger.error('Failed to delete todo:', error);
      throw error;
    }
  }

  async toggleTodoComplete(id: string): Promise<Todo | null> {
    try {
      const todos = await this.getTodos();
      const todo = todos.find(t => t.id === id);
      
      if (!todo) return null;

      const updatedTodo = {
        completed: !todo.completed,
        ...(todo.completed ? {} : { completedAt: new Date() }),
      } as Partial<Todo>;

      const result = await this.updateTodo(id, updatedTodo);
      return result;
    } catch (error) {
      logger.error('Failed to toggle todo complete:', error);
      throw error;
    }
  }

  // Group operations
  async getGroups(): Promise<TodoGroup[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.GROUPS);
      if (!data) return [];
      
      const groups = JSON.parse(data);
      return groups.map((group: any) => ({
        ...group,
        createdAt: new Date(group.createdAt),
      }));
    } catch (error) {
      logger.error('Failed to get groups:', error);
      return [];
    }
  }

  async saveGroups(groups: TodoGroup[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
    } catch (error) {
      logger.error('Failed to save groups:', error);
      throw error;
    }
  }

  async addGroup(group: Omit<TodoGroup, 'id' | 'createdAt'>): Promise<TodoGroup> {
    try {
      const newGroup: TodoGroup = {
        ...group,
        id: Date.now().toString(),
        createdAt: new Date(),
      };

      const groups = await this.getGroups();
      groups.push(newGroup);
      await this.saveGroups(groups);
      
      return newGroup;
    } catch (error) {
      logger.error('Failed to add group:', error);
      throw error;
    }
  }

  async deleteGroup(id: string): Promise<boolean> {
    try {
      const groups = await this.getGroups();
      const filteredGroups = groups.filter(group => group.id !== id);
      
      if (filteredGroups.length === groups.length) return false;
      
      await this.saveGroups(filteredGroups);
      
      // Also remove group association from todos
      const todos = await this.getTodos();
      const updatedTodos = todos.map(todo => 
        todo.groupId === id ? { ...todo, groupId: undefined } : todo
      ) as Todo[];
      await this.saveTodos(updatedTodos);
      
      return true;
    } catch (error) {
      logger.error('Failed to delete group:', error);
      throw error;
    }
  }

  // Settings operations
  async getSettings(): Promise<AppSettings> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) {
        const settings = JSON.parse(data);
        
        // Migration: Add reminderTime if missing
        if (!settings.notifications?.reminderTime) {
          if (!settings.notifications) {
            settings.notifications = DEFAULT_SETTINGS.notifications;
          } else {
            settings.notifications.reminderTime = DEFAULT_SETTINGS.notifications.reminderTime;
          }
          await this.saveSettings(settings);
        }
        
        return settings;
      }
      
      // Return default settings for new users
      await this.saveSettings(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    } catch (error) {
      logger.error('Failed to get settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      logger.error('Failed to save settings:', error);
      throw error;
    }
  }

  async updateSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
    try {
      const current = await this.getSettings();
      const updated = { ...current, ...updates };
      await this.saveSettings(updated);
      return updated;
    } catch (error) {
      logger.error('Failed to update settings:', error);
      throw error;
    }
  }

  // Utility methods
  async clearAllData(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.TODOS),
        AsyncStorage.removeItem(STORAGE_KEYS.GROUPS),
        AsyncStorage.removeItem(STORAGE_KEYS.SETTINGS),
      ]);
    } catch (error) {
      logger.error('Failed to clear all data:', error);
      throw error;
    }
  }
}

export const storageService = StorageService.getInstance();