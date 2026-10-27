import { injectable } from 'inversify';
import { makeObservable, observable, runInAction } from 'mobx';
import { PageViewModel } from '@/app/lifecycle/page_view_model';
import { ProjectApplication } from '@/features/project/application/project_application';
import { ProjectStore } from '@/features/project/domain/enum/project_store';
import type { Project } from '@/features/project/domain/entities/project';

@injectable('Transient')
export class HomeViewModel extends PageViewModel {
  cloudProjects: Project[] = [];
  localProjects: Project[] = [];
  errorMessage = '';

  constructor(private application: ProjectApplication) {
    super();
    makeObservable(this, {
      cloudProjects: observable,
      localProjects: observable,
      errorMessage: observable,
    });
  }

  async ready(): Promise<void> {
    await this.reload();
  }

  async reload(): Promise<void> {
    const [cloud, local] = await Promise.allSettled([
      this.application.list(ProjectStore.REMOTE),
      this.application.list(ProjectStore.LOCAL),
    ]);
    runInAction(() => {
      this.cloudProjects = cloud.status === 'fulfilled' ? cloud.value : [];
      this.localProjects = local.status === 'fulfilled' ? local.value : [];
      this.errorMessage = [cloud, local]
        .filter((result) => result.status === 'rejected')
        .map((result) => (result.reason instanceof Error ? result.reason.message : '加载失败'))
        .join(' ');
    });
  }

  createLocal(): Promise<Project> {
    return this.application.create(ProjectStore.LOCAL);
  }
}
