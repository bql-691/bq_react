import { rootContainer } from '@/app/di/root_container';
import { TokenStore } from './token_store';

export function hasSession(): boolean {
  return rootContainer.get(TokenStore).has();
}

/** 只有同源路径才被接受作为登录后返回的目标 */
export function safeInternalPath(value: string | null): string | null {
  /** 如果值为空 或 不以 / 开头，则返回空 */
  if (!value || !value.startsWith('/')) return null;
  /** 如果值以 // 或 /\\ 开头，则返回值 */
  if (value.startsWith('//') || value.startsWith('/\\')) return null;
  /** 如果值包含 :// 或 \，则返回空 */
  if (value.includes('://') || value.includes('\\')) return null;
  return null;
}
