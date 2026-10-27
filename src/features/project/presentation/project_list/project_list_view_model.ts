import { injectable } from 'inversify';
import { makeObservable, observable, runInAction } from 'mobx';
import { PageViewModel } from '@/app/lifecycle/page_view_model';
import { ProjectApplication } from '../../application/project_application';
import type { ProjectStore } from '../../domain/enum/project_store';
import type { Project } from '../../domain/entities/project';

@injectable('Transient')
export class ProjectListViewModel extends PageViewModel {
  projects: Project[] = [];
  errorMessage = '';

  constructor(private application: ProjectApplication) {
    super();
    makeObservable(this, {
      projects: observable,
      errorMessage: observable,
    });
  }

  async load(store: ProjectStore): Promise<void> {
    try {
      const projects = await this.application.list(store);
      runInAction(() => {
        this.projects = projects;
        this.errorMessage = '';
      });
    } catch (error) {
      runInAction(() => {
        this.projects = [];
        this.errorMessage = error instanceof Error ? error.message : '加载失败';
      });
    }
  }
}
