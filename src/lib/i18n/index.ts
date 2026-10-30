import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../../locales/en.json';
import hi from '../../locales/hi.json';
import es from '../../locales/es.json';
import fr from '../../locales/fr.json';
import de from '../../locales/de.json';
import pt from '../../locales/pt.json';
import ja from '../../locales/ja.json';
import zhCN from '../../locales/zh-CN.json';
import ar from '../../locales/ar.json';

export interface LocaleConfig {
  code: string;
  label: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
}

export const SUPPORTED_LOCALES: LocaleConfig[] = [
  { code: 'en', label: 'English', nativeName: 'English', dir: 'ltr' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr' },
  { code: 'es', label: 'Spanish', nativeName: 'Español', dir: 'ltr' },
  { code: 'fr', label: 'French', nativeName: 'Français', dir: 'ltr' },
  { code: 'de', label: 'German', nativeName: 'Deutsch', dir: 'ltr' },
  { code: 'pt', label: 'Portuguese', nativeName: 'Português', dir: 'ltr' },
  { code: 'ja', label: 'Japanese', nativeName: '日本語', dir: 'ltr' },
  { code: 'zh-CN', label: 'Chinese (Simplified)', nativeName: '简体中文', dir: 'ltr' },
  { code: 'ar', label: 'Arabic', nativeName: 'العربية', dir: 'rtl' },
];

export const DEFAULT_LOCALE = 'en';
export const STORAGE_KEY = 'iqplotter_lang';

export function detectUserLocale(): string {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED_LOCALES.some((l) => l.code === saved)) {
      return saved;
    }

    const browserLangs = navigator.languages || [navigator.language];
    for (const rawLang of browserLangs) {
      if (!rawLang) continue;
      const lower = rawLang.toLowerCase();

      // Exact match (e.g. 'zh-CN')
      const exact = SUPPORTED_LOCALES.find((l) => l.code.toLowerCase() === lower);
      if (exact) return exact.code;

      // Prefix match (e.g. 'es-ES' -> 'es')
      const prefix = lower.split('-')[0];
      const match = SUPPORTED_LOCALES.find((l) => l.code.toLowerCase() === prefix);
      if (match) return match.code;
    }
  } catch (err) {
    console.warn('Locale detection error, falling back to English:', err);
  }

  return DEFAULT_LOCALE;
}

export function syncDocumentDirectionAndLang(localeCode: string) {
  if (typeof document === 'undefined') return;
  const found = SUPPORTED_LOCALES.find((l) => l.code === localeCode);
  const config = found ?? SUPPORTED_LOCALES[0] ?? { code: 'en', dir: 'ltr' as const };
  document.documentElement.lang = config.code;
  document.documentElement.dir = config.dir;
}

const initialLocale = detectUserLocale();
syncDocumentDirectionAndLang(initialLocale);

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      es: { translation: es },
      fr: { translation: fr },
      de: { translation: de },
      pt: { translation: pt },
      ja: { translation: ja },
      'zh-CN': { translation: zhCN },
      ar: { translation: ar },
    },
    lng: initialLocale,
    fallbackLng: DEFAULT_LOCALE,
    interpolation: {
      escapeValue: false, // React handles XSS safely
    },
    missingKeyHandler: (lng, ns, key) => {
      if (import.meta.env.DEV) {
        console.warn(`[i18n] Missing key "${key}" in locale "${lng}" (namespace: "${ns}")`);
      }
    },
  });

i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem(STORAGE_KEY, lng);
    syncDocumentDirectionAndLang(lng);
  } catch (err) {
    console.error('Failed to persist language selection:', err);
  }
});

export default i18n;
