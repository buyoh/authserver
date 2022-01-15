import { MongoClient, Collection, Document } from 'mongodb';
import { kResultInvalid, kResultNotFound } from '../base/error';
import {
  KeyValueStorage,
  KeyValueStorageResult,
  KeyValueStorageResultMany,
} from './KeyValueStorageInterface';

let mongodb = null as MongoClient | null;

export async function connect(mongodbDomain: string): Promise<void> {
  mongodb = await MongoClient.connect('mongodb://' + mongodbDomain);
}

export async function createCollection(
  dbName: string,
  collectionName: string,
  validator?: object
): Promise<void> {
  // NOTE: validator is not used...
  if (mongodb === null) throw null;
  // https://docs.mongodb.com/v4.4/core/schema-validation/
  const db = mongodb.db(dbName);
  await db.createCollection(collectionName, { validator });
}

//
export class MongoStorage implements KeyValueStorage {
  private dbName: string;
  private collectionName: string;
  private collection: Collection<Document> | null;

  constructor(dbName: string, collectionName: string) {
    this.dbName = dbName;
    this.collectionName = collectionName;
    this.collection = null;
  }

  async initialize(): Promise<void> {
    if (mongodb === null) throw new Error('mongodb is not initialized');

    try {
      await createCollection(this.dbName, this.collectionName);
    } catch (e) {
      // Collection already exists
    }

    // check whether the collection exists
    const db = mongodb.db(this.dbName);
    const mayCollection = (await db.collections()).find(
      (c) => c.collectionName == this.collectionName
    );

    if (mayCollection === undefined) {
      throw new Error('not found the collection'); // TODO: identify
    }

    this.collection = db.collection(this.collectionName);
  }

  async get(key: string): Promise<KeyValueStorageResult> {
    if (!this.collection) {
      throw new Error('mongo storage is not initialized');
    }
    const doc = await this.collection.findOne({ id: key });
    if (!doc) {
      return kResultNotFound;
    }
    return {
      ok: true,
      data: doc.data,
    };
  }

  async all(
    length?: number,
    offset?: number
  ): Promise<KeyValueStorageResultMany> {
    if (!this.collection) {
      throw new Error('mongo storage is not initialized');
    }
    const cursor = await this.collection.find(
      {},
      { skip: offset, limit: length }
    );

    const li = (await cursor.toArray()).map((e) => ({
      key: e.id,
      data: e.data,
    }));

    return {
      ok: true,
      data: li,
    };
  }

  async insert(key: string, data: any): Promise<KeyValueStorageResult> {
    if (!this.collection) {
      throw new Error('mongo storage is not initialized');
    }
    const res = await this.collection.insertOne({ id: key, data } as any);
    if (!res.acknowledged) {
      return kResultInvalid;
    }
    // res.insertedId
    return { ok: true };
  }

  async update(key: string, data: any): Promise<KeyValueStorageResult> {
    if (!this.collection) {
      throw new Error('mongo storage is not initialized');
    }
    const res = await this.collection.updateOne(
      { id: key },
      { id: key, ...data },
      { upsert: false }
    );
    if (!res.acknowledged) {
      return kResultInvalid;
    }
    if (res.matchedCount == 0) {
      return kResultNotFound;
    }
    return { ok: true };
  }
  async erase(key: string): Promise<KeyValueStorageResult> {
    if (!this.collection) {
      throw new Error('mongo storage is not initialized');
    }
    const res = await this.collection.deleteOne({ id: key });
    if (!res.acknowledged) {
      return kResultInvalid;
    }
    if (res.deletedCount == 0) {
      return kResultNotFound;
    }
    return { ok: true };
  }
}
