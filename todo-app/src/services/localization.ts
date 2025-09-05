import AsyncStorage from '@react-native-async-storage/async-storage';
import { en } from '../localization/en';
import { de } from '../localization/de';
import type { AppSettings } from '../types/todo';
import { logger } from '../utils/logger';

export type TranslationKeys = typeof en;
export type SupportedLocale = 'en' | 'de';

const translations = {
  en,
  de,
} as const;

/**
 * Localization service for managing app language and translations
 * Provides dynamic language switching and translation lookup
 */
export class LocalizationService {
  private static instance: LocalizationService;
  private currentLocale: SupportedLocale = 'en';
  private currentTranslations: any = en;

  private constructor() {}

  static getInstance(): LocalizationService {
    if (!LocalizationService.instance) {
      LocalizationService.instance = new LocalizationService();
    }
    return LocalizationService.instance;
  }

  /**
   * Initialize localization with saved language preference
   */
  async initialize(): Promise<void> {
    try {
      const settingsData = await AsyncStorage.getItem('@CircleTodo:settings');
      if (settingsData) {
        const settings: AppSettings = JSON.parse(settingsData);
        await this.setLocale(settings.language);
      }
    } catch (error) {
      logger.error('Failed to initialize localization:', error);
    }
  }

  /**
   * Set the current locale and update translations
   */
  async setLocale(locale: SupportedLocale): Promise<void> {
    this.currentLocale = locale;
    this.currentTranslations = translations[locale] as any;
  }

  /**
   * Get translation for a given key path
   */
  t(keyPath: string): string {
    try {
      const keys = keyPath.split('.');
      let value: any = this.currentTranslations;
      
      for (const key of keys) {
        value = value?.[key];
        if (value === undefined) break;
      }
      
      return value || keyPath;
    } catch (error) {
      logger.error('Translation error for key:', keyPath, error);
      return keyPath;
    }
  }

  /**
   * Get current locale
   */
  getCurrentLocale(): SupportedLocale {
    return this.currentLocale;
  }

  /**
   * Get all available locales
   */
  getAvailableLocales(): SupportedLocale[] {
    return Object.keys(translations) as SupportedLocale[];
  }

  /**
   * Set language and persist the setting
   */
  async setLanguage(language: SupportedLocale): Promise<void> {
    await this.setLocale(language);
  }
}

export const localizationService = LocalizationService.getInstance();