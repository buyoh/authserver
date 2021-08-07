import { ResultErrors } from '../base/error';

interface KeyValueStorageResultOk {
  ok: true;
  data?: any;
}

interface KeyValueStorageResultOkMany {
  ok: true;
  data: Array<{ key: string; data?: any }>;
}

export type KeyValueStorageResult = KeyValueStorageResultOk | ResultErrors;

export type KeyValueStorageResultMany =
  | KeyValueStorageResultOkMany
  | ResultErrors;

// ### purpose
// - keyとデータが一対一対応するストレージのインターフェース
// - 書き込みタイミング等の扱いは未考慮
// - initializeは一度だけ呼び出す

export interface KeyValueStorage {
  initialize(): Promise<void>;
  get(key: string): Promise<KeyValueStorageResult>;
  all(length?: number, offset?: number): Promise<KeyValueStorageResultMany>;
  insert(key: string, data: any): Promise<KeyValueStorageResult>;
  update(key: string, data: any): Promise<KeyValueStorageResult>;
  // upsert(key: string, data: any): Promise<KeyValueStorageResult>;
  erase(key: string): Promise<KeyValueStorageResult>;
}
