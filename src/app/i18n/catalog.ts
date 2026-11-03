import i18n from 'i18next';
import { zhCN as commonZh } from './locales/zh_cn';
import { enUS as commonEn } from './locales/en_us';

type Messages = Record<string, unknown>;

const bundles: Record<'zh' | 'en', Record<string, Messages>> = {
  zh: { common: commonZh },
  en: { common: commonEn },
};

/** 注册消息 */
export const registerMessages = (feature: string, locales: { zh: Messages; en: Messages }) => {
  bundles.zh[feature] = locales.zh;
  bundles.en[feature] = locales.en;
  const add = () => {
    i18n.addResourceBundle('zh', 'translation', { [feature]: locales.zh }, true, true);
    i18n.addResourceBundle('en', 'translation', { [feature]: locales.en }, true, true);
  };
  if (i18n.isInitialized) {
    add();
    return;
  }
  i18n.on('initialized', add);
};

/** 构建资源 */
export const buildResources = () => ({
  zh: { translation: bundles.zh },
  en: { translation: bundles.en },
});
