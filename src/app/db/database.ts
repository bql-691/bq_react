import { injectable } from 'inversify';
import { i18n } from '../i18n/i18n';
import { DB_VERSION, schemaVersions } from './schema';

// 本地数据库名称
const DB_NAME = 'local_db';

@injectable('Singleton')
export class Database {
  private opening: Promise<IDBDatabase> | null = null;

  reset(): Promise<void> {
    this.opening = null;
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(DB_NAME);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error ?? new Error(i18n.t('common.db_delete_failed')));
      request.onblocked = () => reject(new Error(i18n.t('common.db_delete_blocked')));
    });
  }

  open(): Promise<IDBDatabase> {
    this.opening ??= this.connect();
    return this.opening;
  }

  private connect(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error(i18n.t('common.db_unavailable')));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const versionChange = event as IDBVersionChangeEvent;
        const transaction = request.transaction;
        if (!transaction) {
          reject(new Error(i18n.t('common.db_upgrade_missing')));
          return;
        }
        try {
          this.upgrade(
            request.result,
            transaction,
            versionChange.oldVersion,
            versionChange.newVersion ?? DB_VERSION,
          );
        } catch (error) {
          reject(error);
        }
      };

      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => {
          db.close();
          this.opening = null;
        };
        resolve(db);
      };

      request.onerror = () => {
        this.opening = null;
        reject(request.error ?? new Error(i18n.t('common.db_open_failed')));
      };

      request.onblocked = () => {
        this.opening = null;
        reject(new Error(i18n.t('common.db_open_blocked')));
      };
    });
  }

  /** oldVersion 从 0 起。停在旧版本的浏览器会依次执行中间每一版。 */
  private upgrade(
    db: IDBDatabase,
    transaction: IDBTransaction,
    oldVersion: number,
    newVersion: number,
  ) {
    for (let version = oldVersion; version < newVersion; version += 1) {
      const upgrade = schemaVersions[version];
      if (!upgrade) {
        throw new Error(i18n.t('common.db_schema_missing', { version: version + 1 }));
      }
      upgrade(db, transaction);
    }
  }
}
