// src/features/security/presentation/security_view_model.ts
import { injectable } from 'inversify';
import { makeObservable, observable, action, runInAction } from 'mobx';
import { SecurityApplication } from '../../application/security_application';
import { I18n } from '@/app/i18n/i18n';
import { AuthEnum } from '../../domain/enum/auth_enum';
import { AuthCredentials } from '../../domain/entities/auth_credentials';
import { RegisterCredentials } from '../../domain/entities/register_credentials';
import { PageViewModel } from '@/app/lifecycle/page_view_model';

@injectable('Transient')
export class SecurityViewModel extends PageViewModel {
  public activeTab: AuthEnum = AuthEnum.LOGIN;
  public isLoading = false;
  public errorMessage = '';

  public loginForm = new AuthCredentials({});
  public registerForm = new RegisterCredentials({});

  constructor(
    private application: SecurityApplication,
    private i18n: I18n,
  ) {
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
      this.errorMessage = this.i18n.translate(currentForm.validationErrorKey);
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
    } catch (err: any) {
      runInAction(() => {
        this.errorMessage = err.message || 'Error';
      });
      return false;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }
}
