// features/security/i18n/index.ts
import { registerMessages } from '@app';
import { zhCN } from './zh_cn';
import { enUS } from './en_us';

registerMessages('security', { zh: zhCN, en: enUS });
