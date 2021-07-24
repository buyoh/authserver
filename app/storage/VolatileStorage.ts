import { AppStorage, AppStorageResult } from './AppStorageInterface';

export class VolatileStorage implements AppStorage {
  private storage: { [key: string]: string };
  initialize(): AppStorageResult {
    this.storage = {};
    return { ok: true };
  }
  find(query: any): AppStorageResult {
    const key = JSON.stringify(query);
    if (!this.storage[key]) {
      return {
        ok: false,
        result: 'notfound',
      };
    }
    return {
      ok: true,
      data: JSON.parse(this.storage[key]),
    };
  }
  findAll(query: any): AppStorageResult {
    throw new Error('Method not implemented.');
  }
  update(query: any, data: any): AppStorageResult {
    const key = JSON.stringify(query);
    const data_str = JSON.stringify(query);
    const _ = JSON.parse(data_str); // It may throw error.
    this.storage[key] = data_str;
    return { ok: true };
  }
  erase(query: any): AppStorageResult {
    const key = JSON.stringify(query);
    delete this.storage[key];
    return { ok: true };
  }
}
