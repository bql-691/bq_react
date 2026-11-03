import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { buildResources } from './catalog';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: buildResources(),
    fallbackLng: 'zh',
    interpolation: { escapeValue: false },
    parseMissingKeyHandler: (key: string) => {
      const dot = key.indexOf('.');
      if (dot <= 0) return key;
      if (key.slice(0, dot) === 'common') return key;
      const commonKey = `common.${key.slice(dot + 1)}`;
      return i18n.exists(commonKey) ? String(i18n.t(commonKey)) : key;
    },
  });

export { i18n };
