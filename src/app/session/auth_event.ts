export const AUTH_CHANGED = 'auth-changed';

export function notifyAuthChanged(): void {
  window.dispatchEvent(new Event(AUTH_CHANGED));
}

export function subscribeAuth(listener: () => void): () => void {
  window.addEventListener(AUTH_CHANGED, listener);
  return () => window.removeEventListener(AUTH_CHANGED, listener);
}
