import type { SchemaUpgrade } from './schema_upgrade';

export const PROJECTS_STORE = 'projects';

/** 初始版本：本地项目。 */
export const upgradeV1: SchemaUpgrade = (db) => {
  if (!db.objectStoreNames.contains(PROJECTS_STORE)) {
    db.createObjectStore(PROJECTS_STORE, { keyPath: 'id' });
  }
};
