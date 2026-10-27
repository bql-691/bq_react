import { theme, type ThemeConfig } from 'antd';
import type { ResolvedTheme } from './theme';

export function antdTheme(resolved: ResolvedTheme): ThemeConfig {
  return {
    algorithm: resolved === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
    cssVar: { key: 'bq' },
  };
}
