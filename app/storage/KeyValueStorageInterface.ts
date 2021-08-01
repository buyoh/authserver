interface KeyValueStorageResultOk {
  ok: true;
  data?: any;
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

export interface KeyValueStorage {
  initialize(): Promise<KeyValueStorageResult>;
  get(key: string): Promise<KeyValueStorageResult>;
  insert(key: string, data: any): Promise<KeyValueStorageResult>;
  update(key: string, data: any): Promise<KeyValueStorageResult>;
  // upsert(key: string, data: any): Promise<KeyValueStorageResult>;
  erase(key: string): Promise<KeyValueStorageResult>;
}
