// src/features/security/application/security_application.ts
import { injectable } from 'inversify';
import { tokenStore } from '@app';
import type { AuthCredentials } from '../domain/entities/auth_credentials';
import type { RegisterCredentials } from '../domain/entities/register_credentials';
import { ISecurityRepository } from '../domain/repositories/i_security_repository';

@injectable('Singleton')
export class SecurityApplication {
  constructor(private repository: ISecurityRepository) {}

  /**
   * 登录用例
   */
  async login(credentials: AuthCredentials): Promise<void> {
    const result = await this.repository.login(credentials);
    tokenStore.save(result.accessToken);
  }

  /**
   * 登出用例：清理用户登录凭证
   */
  async logout(): Promise<void> {
    tokenStore.remove();
  }

  /**
   * 注册用例
   */
  public async register(credentials: RegisterCredentials): Promise<void> {
    await this.repository.register(credentials);
  }
}
