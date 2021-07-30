import { AppStorage, AppStorageResult } from './AppStorageInterface';

export class VolatileStorage implements AppStorage {
  private storage: { [key: string]: string };
  async initialize(): Promise<AppStorageResult> {
    this.storage = {};
    return { ok: true };
  }
  async find(query: any): Promise<AppStorageResult> {
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
  async findAll(query: any): Promise<AppStorageResult> {
    throw new Error('Method not implemented.');
  }
  async update(query: any, data: any): Promise<AppStorageResult> {
    const key = JSON.stringify(query);
    const data_str = JSON.stringify(query);
    const _ = JSON.parse(data_str); // It may throw error.
    this.storage[key] = data_str;
    return { ok: true };
  }
  async erase(query: any): Promise<AppStorageResult> {
    const key = JSON.stringify(query);
    delete this.storage[key];
    return { ok: true };
  }
}
