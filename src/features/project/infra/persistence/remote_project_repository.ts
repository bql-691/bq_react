import { injectable } from 'inversify';
import { getSnapshot } from 'mobx-keystone';
import { Http } from '@/app/network/http';
import { bindAs } from '@/app/di/bind_as';
import { ProjectStore } from '../../domain/enum/project_store';
import { Project } from '../../domain/entities/project';
import { IProjectRepository } from '../../domain/repositories/i_project_repository';

@bindAs(IProjectRepository, ProjectStore.REMOTE)
@injectable('Singleton')
export class RemoteProjectRepository implements IProjectRepository {
  url = '/projects';
  constructor(private http: Http) {}

  async list(): Promise<Project[]> {
    const data = (await this.http.instance.get(this.url)) as unknown;
    if (!Array.isArray(data)) return [];
    return data.map((item) => Project.fromData(item));
  }

  async get(id: string): Promise<Project | null> {
    try {
      const data = (await this.http.instance.get(`${this.url}/${id}`)) as unknown;
      if (!data || typeof data !== 'object') return null;
      return Project.fromData(data);
    } catch {
      return null;
    }
  }

  async save(project: Project): Promise<void> {
    await this.http.instance.put(`${this.url}/${project.id}`, getSnapshot(project));
  }
}
