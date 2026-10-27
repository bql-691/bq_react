import type { SchemaUpgrade } from './schema_upgrade';
import { upgradeV1 } from './v1';

export type { SchemaUpgrade };

/** 按版本顺序排列。已发布的版本只追加，不改旧文件。 */
export const schemaVersions: SchemaUpgrade[] = [upgradeV1];

export const DB_VERSION = schemaVersions.length;
