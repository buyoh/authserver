interface AppStorageResultOk {
  ok: true;
  data?: any;
}

interface AppStorageResultNotFound {
  ok: false;
  result: 'notfound';
}

interface AppStorageResultForbidden {
  ok: false;
  result: 'forbidden';
}

interface AppStorageResultUnexpected {
  ok: false;
  result: 'error';
  detail: string | undefined;
}

export type AppStorageResult =
  | AppStorageResultOk
  | AppStorageResultNotFound
  | AppStorageResultForbidden
  | AppStorageResultUnexpected;

export interface AppStorage {
  initialize(): AppStorageResult;
  find(query: any): AppStorageResult;
  findAll(query: any): AppStorageResult;
  update(query: any, data: any): AppStorageResult;
  erase(query: any): AppStorageResult;
}
