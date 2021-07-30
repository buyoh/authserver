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
  detail?: string;
}

export type AppStorageResult =
  | AppStorageResultOk
  | AppStorageResultNotFound
  | AppStorageResultForbidden
  | AppStorageResultUnexpected;

export interface AppStorage {
  initialize(): Promise<AppStorageResult>;
  find(query: any): Promise<AppStorageResult>;
  findAll(query: any): Promise<AppStorageResult>;
  update(data: any): Promise<AppStorageResult>;
  erase(query: any): Promise<AppStorageResult>;
}
