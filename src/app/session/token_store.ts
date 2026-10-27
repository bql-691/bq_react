import { injectable } from 'inversify';
import { notifyAuthChanged } from './auth_event';

@injectable('Singleton')
export class TokenStore {
  private readonly tokenKey = '_sys_auth_token_';
  private readonly secretSalt = 'APP_PLATFORM_SALT_2026';

  save(token: string): void {
    localStorage.setItem(this.tokenKey, this.encrypt(token));
    notifyAuthChanged();
  }

  get(): string | null {
    const encrypted = localStorage.getItem(this.tokenKey);
    if (!encrypted) return null;
    const token = this.decrypt(encrypted);
    return token || null;
  }

  remove(): void {
    localStorage.removeItem(this.tokenKey);
    notifyAuthChanged();
  }

  has(): boolean {
    return this.get() !== null;
  }

  private encrypt(value: string): string {
    return btoa(encodeURIComponent(value) + this.secretSalt);
  }

  private decrypt(ciphertext: string): string {
    try {
      const decoded = atob(ciphertext);
      return decodeURIComponent(decoded.replace(this.secretSalt, ''));
    } catch {
      return '';
    }
  }
}
