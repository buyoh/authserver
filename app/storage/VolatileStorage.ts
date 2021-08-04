import { kResultNotFound, kResultInvalid } from '../base/error';
import {
  KeyValueStorage,
  KeyValueStorageResult,
  KeyValueStorageResultMany,
} from './KeyValueStorageInterface';

export class VolatileStorage implements KeyValueStorage {
  private storage: { [key: string]: string };
  async initialize(): Promise<KeyValueStorageResult> {
    this.storage = {};
    return { ok: true };
  }
  async get(key: string): Promise<KeyValueStorageResult> {
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
    if (offset === undefined) offset = 0;
    if (length === undefined) length = Object.keys(this.storage).length;
    const li = Object.entries(this.storage)
      .slice(offset, offset + length)
      .map((kv) => ({ key: kv[0], data: kv[1] }));
    return {
      ok: true,
      data: li,
    };
  }
  async insert(key: string, data: any): Promise<KeyValueStorageResult> {
    if (this.storage[key]) {
      return kResultInvalid;
    }
    const data_str = JSON.stringify(data);
    this.storage[key] = data_str;
    return { ok: true };
  }
  async update(key: string, data: any): Promise<KeyValueStorageResult> {
    if (!this.storage[key]) {
      return kResultInvalid;
    }
    const data_str = JSON.stringify(data);
    const _ = JSON.parse(data_str); // It may throw error.
    this.storage[key] = data_str;
    return { ok: true };
  }
  async erase(query: any): Promise<KeyValueStorageResult> {
    const key = JSON.stringify(query);
    delete this.storage[key];
    return { ok: true };
  }
}
