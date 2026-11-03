import { injectable } from 'inversify';
import { fromSnapshot, getSnapshot } from 'mobx-keystone';
import { bindAs, Database, i18n, PROJECTS_STORE } from '@app';
import { ProjectStore } from '../../domain/enum/project_store';
import { Project } from '../../domain/entities/project';
import { IProjectRepository } from '../../domain/repositories/i_project_repository';

@bindAs(IProjectRepository, ProjectStore.LOCAL)
@injectable('Singleton')
export class LocalProjectRepository implements IProjectRepository {
  constructor(private database: Database) {}

  async list(): Promise<Project[]> {
    const records = await this.readAll();
    return records
      .map((record) => fromSnapshot(Project, record as never))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async get(id: string): Promise<Project | null> {
    const db = await this.ensure();
    const record = await this.requestToPromise(
      db.transaction(PROJECTS_STORE, 'readonly').objectStore(PROJECTS_STORE).get(id),
    );
    if (!record) return null;
    return fromSnapshot(Project, record as never);
  }

  async save(project: Project): Promise<void> {
    const db = await this.ensure();
    await this.requestToPromise(
      db
        .transaction(PROJECTS_STORE, 'readwrite')
        .objectStore(PROJECTS_STORE)
        .put(getSnapshot(project)),
    );
  }

  private async readAll(): Promise<unknown[]> {
    const db = await this.ensure();
    const records = await this.requestToPromise(
      db.transaction(PROJECTS_STORE, 'readonly').objectStore(PROJECTS_STORE).getAll(),
    );
    return Array.isArray(records) ? records : [];
  }

  private async ensure(allowReset = true): Promise<IDBDatabase> {
    const db = await this.database.open();
    if (db.objectStoreNames.contains(PROJECTS_STORE)) return db;
    if (!allowReset) throw new Error(i18n.t('project.missing_store'));
    db.close();
    await this.database.reset();
    return this.ensure(false);
  }

  private requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error(i18n.t('project.request_failed')));
    });
  }
}
