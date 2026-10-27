// src/features/security/domain/entities/auth_credentials.ts
import { Model, model, modelAction, tProp, types } from 'mobx-keystone';

@model('security/AuthCredentials')
export class AuthCredentials extends Model({
  username: tProp(types.string, ''),
  password: tProp(types.string, ''),
}) {
  @modelAction
  setUsername(value: string) {
    this.username = value;
  }

  @modelAction
  setPassword(value: string) {
    this.password = value;
  }

  public get isValid(): boolean {
    return this.isUsernameValid && this.isPasswordValid;
  }

  public get isUsernameValid(): boolean {
    return this.username.trim().length >= 3;
  }
  public get isPasswordValid(): boolean {
    return this.password.length >= 6;
  }

  public get validationErrorKey(): string {
    if (!this.isUsernameValid) return 'security.err_username_length';
    if (!this.isPasswordValid) return 'security.err_password_length';
    return '';
  }
}
