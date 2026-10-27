import { injectable } from 'inversify';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { buildResources } from './catalog';

export { i18n };

@injectable()
export class I18n {
  constructor() {
    i18n
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        // 设置翻译资源
        resources: buildResources(),
        // 设置默认语言
        fallbackLng: 'zh',
        // 设置插值方式
        interpolation: { escapeValue: false },
        // 处理缺失的翻译键
        parseMissingKeyHandler: (key: string) => {
          const dot = key.indexOf('.');
          if (dot <= 0) return key;
          if (key.slice(0, dot) === 'common') return key;
          const commonKey = `common.${key.slice(dot + 1)}`;
          return i18n.exists(commonKey) ? String(i18n.t(commonKey)) : key;
        },
      });
  }

  /**
   * 💡 通用翻译代理方法
   */
  public translate(key: string, options?: any): string {
    return i18n.t(key, options) as string;
  }

  /**
   * 💡 动态切换语言方法
   */
  public changeLanguage(lng: 'zh' | 'en'): void {
    i18n.changeLanguage(lng);
  }

  public get currentLanguage(): string {
    return i18n.language;
  }
}
