import { KeyValueStorage } from './KeyValueStorageInterface';
import * as MongoStorage from './MongoStorage';

// TODO abstruction
export async function createMongoStorage(
  dbName: string,
  collectionName: string
): Promise<KeyValueStorage> {
  await MongoStorage.connect();
  try {
    await MongoStorage.createCollection(dbName, collectionName);
  } catch (e) {
    console.warn('Collection already exists?');
    // Collection already exists
  }

  const storage = await new MongoStorage.MongoStorage(dbName, collectionName);
  await storage.initialize();
  return storage;
}
