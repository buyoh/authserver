import { MongoClient, Collection, Document } from 'mongodb';
import { AppStorage, AppStorageResult } from './AppStorageInterface';

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

// implements AppStorage
export class MongoStorage {
  private dbName: string;
  private collectionName: string;
  private collection: Collection<Document> | null;

  constructor(dbName: string, collectionName: string) {
    this.dbName = dbName;
    this.collectionName = collectionName;
    this.collection = null;
  }

  async initialize(): Promise<AppStorageResult> {
    if (mongodb === null) return { ok: false, result: 'error' };

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

  async find(query: any): Promise<AppStorageResult> {
    if (!this.collection) {
      return { ok: false, result: 'error' };
    }
    const doc = await this.collection.findOne(query);
    if (doc === null) {
      return { ok: false, result: 'notfound' };
    }
    return {
      ok: true,
      data: doc,
    };
  }

  async findAll(query: any): Promise<AppStorageResult> {
    if (!this.collection) {
      return { ok: false, result: 'error' };
    }
    const docs = await this.collection.find(query);
    // TODO: limit length
    return {
      ok: true,
      data: await docs.toArray(),
    };
  }

  async insert(data: any): Promise<AppStorageResult> {
    if (!this.collection) {
      return { ok: false, result: 'error' };
    }
    await this.collection.insertOne(data);
    // res.insertedId
    return { ok: true };
  }

  async update(query: any, data: any): Promise<AppStorageResult> {
    if (!this.collection) {
      return { ok: false, result: 'error' };
    }
    await this.collection.insertOne(query, data);
    // res.insertedId
    return { ok: true };
  }
  async erase(query: any): Promise<AppStorageResult> {
    throw new Error('Method not implemented.');
  }
}
