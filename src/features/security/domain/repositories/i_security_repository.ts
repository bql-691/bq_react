import type { AuthCredentials } from '../entities/auth_credentials';
import type { LoginResult } from '../entities/login_result';
import type { RegisterCredentials } from '../entities/register_credentials';

export abstract class ISecurityRepository {
  abstract login(credentials: AuthCredentials): Promise<LoginResult>;
  abstract register(credentials: RegisterCredentials): Promise<void>;
}
