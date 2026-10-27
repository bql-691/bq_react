import type { Project } from '../entities/project';

export abstract class IProjectRepository {
  abstract list(): Promise<Project[]>;
  abstract get(id: string): Promise<Project | null>;
  abstract save(project: Project): Promise<void>;
}
