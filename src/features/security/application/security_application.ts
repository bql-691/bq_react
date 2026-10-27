// src/features/security/application/security_application.ts
import { injectable } from 'inversify';
import { TokenStore } from '@/app/session/token_store';
import type { AuthCredentials } from '../domain/entities/auth_credentials';
import type { RegisterCredentials } from '../domain/entities/register_credentials';
import { ISecurityRepository } from '../domain/repositories/i_security_repository';

@injectable('Singleton')
export class SecurityApplication {
  constructor(
    private repository: ISecurityRepository,
    private tokenStore: TokenStore,
  ) {}

  /**
   * 登录用例
   */
  async login(credentials: AuthCredentials): Promise<void> {
    const result = await this.repository.login(credentials);
    this.tokenStore.save(result.accessToken);
  }

  /**
   * 登出用例：清理用户登录凭证
   */
  async logout(): Promise<void> {
    this.tokenStore.remove();
  }

  /**
   * 注册用例
   */
  public async register(credentials: RegisterCredentials): Promise<void> {
    await this.repository.register(credentials);
  }
}
