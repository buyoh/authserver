import { MongoClient, Collection, Document } from 'mongodb';
import { kResultInvalid, kResultNotFound } from '../base/error';
import {
  KeyValueStorage,
  KeyValueStorageResult,
  KeyValueStorageResultMany,
} from './KeyValueStorageInterface';

let mongodb = null as MongoClient | null;

export async function connect(): Promise<void> {
  mongodb = await MongoClient.connect('mongodb://root:example@127.0.0.1:27017');
}

export async function createCollection(
  dbName: string,
  collectionName: string,
  validator?: object
): Promise<void> {
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
    const doc = await this.collection.findOne({ _id: key });
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
      key: e._id,
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
    const res = await this.collection.insertOne({ _id: key, data } as any);
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
      { _id: key },
      { _id: key, ...data },
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
    const res = await this.collection.deleteOne({ _id: key });
    if (!res.acknowledged) {
      return kResultInvalid;
    }
    if (res.deletedCount == 0) {
      return kResultNotFound;
    }
    return { ok: true };
  }
}
