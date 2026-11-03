// src/features/security/presentation/security_view_model.ts
import { injectable } from 'inversify';
import { makeObservable, observable, action, runInAction } from 'mobx';
import { i18n, PageViewModel } from '@app';
import { SecurityApplication } from '../../application/security_application';
import { AuthEnum } from '../../domain/enum/auth_enum';
import { AuthCredentials } from '../../domain/entities/auth_credentials';
import { RegisterCredentials } from '../../domain/entities/register_credentials';

@injectable('Transient')
export class SecurityViewModel extends PageViewModel {
  public activeTab: AuthEnum = AuthEnum.LOGIN;
  public isLoading = false;
  public errorMessage = '';

  public loginForm = new AuthCredentials({});
  public registerForm = new RegisterCredentials({});

  constructor(private application: SecurityApplication) {
    super();
    makeObservable(this, {
      activeTab: observable,
      isLoading: observable,
      errorMessage: observable,
      switchTab: action,
      submit: action,
    });
  }

  dispose(): void {
    this.errorMessage = '';
  }

  public switchTab(tab: AuthEnum) {
    this.activeTab = tab;
    this.errorMessage = '';
  }

  public async submit(): Promise<boolean> {
    this.errorMessage = '';
    const currentForm = this.activeTab === AuthEnum.LOGIN ? this.loginForm : this.registerForm;

    if (!currentForm.isValid) {
      this.errorMessage = i18n.t(currentForm.validationErrorKey);
      return false;
    }

    this.isLoading = true;

    try {
      if (this.activeTab === AuthEnum.LOGIN) {
        await this.application.login(this.loginForm);
        return true;
      }
      await this.application.register(this.registerForm);
      runInAction(() => this.switchTab(AuthEnum.LOGIN));
      return false;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';
      runInAction(() => {
        this.errorMessage = message || i18n.t('common.error');
      });
      return false;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }
}
