import { injectable } from 'inversify';
import { getSnapshot } from 'mobx-keystone';
import { Http } from '@/app/network/http';
import { bindAs } from '@/app/di/bind_as';
import { AuthCredentials } from '../../domain/entities/auth_credentials';
import { LoginResult } from '../../domain/entities/login_result';
import { RegisterCredentials } from '../../domain/entities/register_credentials';
import { User } from '../../domain/entities/user';
import { ISecurityRepository } from '../../domain/repositories/i_security_repository';

type LoginResponse = {
  token?: unknown;
  user?: { id?: unknown; username?: unknown; roles?: unknown };
};

@bindAs(ISecurityRepository)
@injectable('Singleton')
export class SecurityRepository implements ISecurityRepository {
  constructor(private http: Http) {}

  public async login(credentials: AuthCredentials): Promise<LoginResult> {
    const data = (await this.http.instance.post(
      '/auth/login',
      getSnapshot(credentials),
    )) as LoginResponse;
    const token = typeof data.token === 'string' ? data.token : '';
    const body = data.user;
    const roles = Array.isArray(body?.roles)
      ? body.roles.filter((role) => typeof role === 'string')
      : [];
    const user = new User(
      typeof body?.id === 'string' ? body.id : '',
      typeof body?.username === 'string' ? body.username : credentials.username,
      roles,
    );
    return new LoginResult(user, token);
  }

  public async register(credentials: RegisterCredentials): Promise<void> {
    await this.http.instance.post('/auth/register', getSnapshot(credentials));
  }
}
