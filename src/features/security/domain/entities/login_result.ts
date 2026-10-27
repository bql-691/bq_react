import type { User } from './user';

export class LoginResult {
  constructor(
    readonly user: User,
    readonly accessToken: string,
  ) {}
}
