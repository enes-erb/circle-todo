import * as Localization from 'expo-localization';
import { en } from './en';
import { de } from './de';

export type TranslationKeys = typeof en;

const translations = {
  en,
  de,
} as const;

export type SupportedLocale = keyof typeof translations;

export const getLocale = (): SupportedLocale => {
  const deviceLocale = Localization.getLocales()[0]?.languageCode as SupportedLocale;
  return translations[deviceLocale] ? deviceLocale : 'en';
};

export const getCurrentTranslations = (): TranslationKeys => {
  const locale = getLocale();
  return translations[locale] as TranslationKeys;
};

export const t = getCurrentTranslations();