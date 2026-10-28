import { inject, injectable, named } from 'inversify';
import { Project } from '../domain/entities/project';
import { ProjectStore } from '../domain/enum/project_store';
import { IProjectRepository } from '../domain/repositories/i_project_repository';

@injectable('Singleton')
export class ProjectApplication {
  constructor(
    @inject(IProjectRepository)
    @named(ProjectStore.LOCAL)
    private localRepository: IProjectRepository,
    @inject(IProjectRepository)
    @named(ProjectStore.REMOTE)
    private remoteRepository: IProjectRepository,
  ) {}

  list(store: ProjectStore): Promise<Project[]> {
    return this.repository(store).list();
  }

  get(store: ProjectStore, id: string): Promise<Project | null> {
    return this.repository(store).get(id);
  }

  async save(store: ProjectStore, project: Project): Promise<void> {
    project.touch();
    await this.repository(store).save(project);
  }

  async create(store: ProjectStore, name = '未命名'): Promise<Project> {
    const project = Project.create(name);
    await this.repository(store).save(project);
    return project;
  }

  private repository(store: ProjectStore): IProjectRepository {
    return store === ProjectStore.REMOTE ? this.remoteRepository : this.localRepository;
  }
}
