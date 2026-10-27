import { ExtendedModel, model, modelAction, tProp, types } from 'mobx-keystone';
import { AuthCredentials } from './auth_credentials';

@model('security/RegisterCredentials')
export class RegisterCredentials extends ExtendedModel(AuthCredentials, {
  confirmPassword: tProp(types.string, ''),
}) {
  @modelAction
  setConfirmPassword(value: string) {
    this.confirmPassword = value;
  }

  public override get isValid(): boolean {
    return super.isValid && this.password === this.confirmPassword;
  }

  public override get validationErrorKey(): string {
    const parentKey = super.validationErrorKey;
    if (parentKey) return parentKey;
    if (this.password !== this.confirmPassword) return 'security.err_password_mismatch';
    return '';
  }
}
