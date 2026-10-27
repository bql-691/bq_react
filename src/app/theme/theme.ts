export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'bq-theme';
const SYSTEM_QUERY = '(prefers-color-scheme: dark)';

const listeners = new Set<() => void>();
let media: MediaQueryList | null = null;

export function getThemeMode(): ThemeMode {
  if (typeof localStorage === 'undefined') return 'system';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  } catch {
    return 'system';
  }
  return 'system';
}

export function resolveTheme(mode: ThemeMode = getThemeMode()): ResolvedTheme {
  if (mode === 'light' || mode === 'dark') return mode;
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'light';
  return window.matchMedia(SYSTEM_QUERY).matches ? 'dark' : 'light';
}

export function applyTheme(mode: ThemeMode = getThemeMode()): ResolvedTheme {
  const resolved = resolveTheme(mode);
  paint(resolved);
  watchSystemTheme(mode);
  return resolved;
}

export function setThemeMode(mode: ThemeMode): void {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // 隐私模式写不进去时，本次会话仍然切换。
  }
  applyTheme(mode);
  emit();
}

export function subscribeTheme(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function paint(resolved: ResolvedTheme) {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = resolved;
  document.documentElement.style.colorScheme = resolved;
}

function watchSystemTheme(mode: ThemeMode) {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
  media ??= window.matchMedia(SYSTEM_QUERY);
  media.removeEventListener('change', onSystemThemeChange);
  if (mode === 'system') media.addEventListener('change', onSystemThemeChange);
}

function onSystemThemeChange() {
  paint(resolveTheme('system'));
  emit();
}

function emit() {
  listeners.forEach((listener) => listener());
}
