interface KeyValueStorageResultOk {
  ok: true;
  data?: any;
}

interface KeyValueStorageResultOkMany {
  ok: true;
  data: Array<{ key: string; data?: any }>;
}

interface KeyValueStorageResultNotFound {
  ok: false;
  result: 'notfound';
}

interface KeyValueStorageResultForbidden {
  ok: false;
  result: 'forbidden';
}

interface KeyValueStorageResultInvalid {
  ok: false;
  result: 'invalid';
}

interface KeyValueStorageResultUnexpected {
  ok: false;
  result: 'error';
  detail?: string;
}

export type KeyValueStorageResult =
  | KeyValueStorageResultOk
  | KeyValueStorageResultNotFound
  | KeyValueStorageResultForbidden
  | KeyValueStorageResultUnexpected
  | KeyValueStorageResultInvalid;

export type KeyValueStorageResultMany =
  | KeyValueStorageResultOkMany
  | KeyValueStorageResultForbidden
  | KeyValueStorageResultUnexpected
  | KeyValueStorageResultInvalid;

// ### purpose
// - keyとデータが一対一対応するストレージのインターフェース
// - 書き込みタイミング等の扱いは未考慮
// - initializeは一度だけ呼び出す

export interface KeyValueStorage {
  initialize(): Promise<KeyValueStorageResult>;
  get(key: string): Promise<KeyValueStorageResult>;
  all(length?: number, offset?: number): Promise<KeyValueStorageResultMany>;
  insert(key: string, data: any): Promise<KeyValueStorageResult>;
  update(key: string, data: any): Promise<KeyValueStorageResult>;
  // upsert(key: string, data: any): Promise<KeyValueStorageResult>;
  erase(key: string): Promise<KeyValueStorageResult>;
}
