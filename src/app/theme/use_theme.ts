import { useSyncExternalStore } from 'react';
import {
  getThemeMode,
  resolveTheme,
  subscribeTheme,
  type ResolvedTheme,
  type ThemeMode,
} from './theme';

export function useThemeMode(): ThemeMode {
  return useSyncExternalStore(subscribeTheme, getThemeMode, () => 'system');
}

export function useResolvedTheme(): ResolvedTheme {
  return useSyncExternalStore(
    subscribeTheme,
    () => resolveTheme(getThemeMode()),
    () => 'light',
  );
}
