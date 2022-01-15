import { KeyValueStorage } from './KeyValueStorageInterface';
import * as MongoStorage from './MongoStorage';
import * as VolatileStorage from './VolatileStorage';

type MongoOptionType = { mongodbDomain?: string };
type KeyValueStorageImplOptionType = MongoOptionType;

export async function createMongoStorage(
  dbName: string,
  collectionName: string,
  options: MongoOptionType
): Promise<KeyValueStorage> {
  const mongodbDomain = options.mongodbDomain || 'root:example@127.0.0.1:27017';
  await MongoStorage.connect(mongodbDomain);

  const storage = new MongoStorage.MongoStorage(dbName, collectionName);
  await storage.initialize();
  return storage;
}

export async function createVolatileStorage(
  dbName: string
): Promise<KeyValueStorage> {
  const storage = new VolatileStorage.VolatileStorage(dbName);
  await storage.initialize();
  return storage;
}

export async function createStorage(
  dbImplType: string,
  dbName: string,
  collectionName: string,
  option?: KeyValueStorageImplOptionType
): Promise<KeyValueStorage> {
  if (!option) option = {};
  let selectedDbImpl = 'memory';
  if (dbImplType === 'mongo') selectedDbImpl = 'mongo';

  if (selectedDbImpl === 'memory') {
    return await createVolatileStorage(dbName + '@' + collectionName);
  } else if (selectedDbImpl === 'mongo') {
    return await createMongoStorage(dbName, collectionName, option);
  }
}
