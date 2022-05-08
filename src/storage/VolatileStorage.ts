import {
  kResultNotFound,
  kResultInvalid,
  kResultInternalError,
} from '../base/error';
import {
  KeyValueStorage,
  KeyValueStorageResult,
  KeyValueStorageResultMany,
} from './KeyValueStorageInterface';

const globalStore = {} as { [key: string]: { [key: string]: string } };

export class VolatileStorage implements KeyValueStorage {
  private storage: { [key: string]: string };
  private initialized: boolean;

  constructor(dbName: string) {
    this.storage = globalStore[dbName] || {};
    this.initialized = false;
  }

  async initialize(): Promise<void> {
    this.initialized = true;
  }

  async get(key: string): Promise<KeyValueStorageResult> {
    if (!this.initialized) return kResultInternalError;
    if (!this.storage[key]) {
      return kResultNotFound;
    }
    return {
      ok: true,
      data: JSON.parse(this.storage[key]),
    };
  }

  async all(
    length?: number,
    offset?: number
  ): Promise<KeyValueStorageResultMany> {
    if (!this.initialized) return kResultInternalError;
    if (offset === undefined) offset = 0;
    if (length === undefined) length = Object.keys(this.storage).length;
    const li = Object.entries(this.storage)
      .slice(offset, offset + length)
      .map((kv) => ({ key: kv[0], data: JSON.parse(kv[1]) }));
    return {
      ok: true,
      data: li,
    };
  }

  async insert(key: string, data: any): Promise<KeyValueStorageResult> {
    if (!this.initialized) return kResultInternalError;
    if (this.storage[key]) {
      return kResultInvalid;
    }
    const data_str = JSON.stringify(data);
    this.storage[key] = data_str;
    return { ok: true };
  }

  async update(key: string, data: any): Promise<KeyValueStorageResult> {
    if (!this.initialized) return kResultInternalError;
    if (!this.storage[key]) {
      return kResultInvalid;
    }
    const data_str = JSON.stringify(data);
    const _ = JSON.parse(data_str); // It may throw error.
    this.storage[key] = data_str;
    return { ok: true };
  }

  async erase(key: string): Promise<KeyValueStorageResult> {
    if (!this.initialized) return kResultInternalError;
    delete this.storage[key];
    return { ok: true };
  }
}
