import type { Document } from 'mongodb';
import { MongoClient, ReadPreference } from 'mongodb';
import { mongoUri } from './environment.js';

let client: MongoClient;

export const getCollection = <T extends Document>(dbName: string, collectionName: string) =>
  client.db(dbName).collection<T>(collectionName);

export const init = async () => {
  client = await MongoClient.connect(mongoUri, {
    readPreference: ReadPreference.PRIMARY,
    retryWrites: true,
    w: 'majority',
  });
  console.log('mongo init success');
  return () => client.close();
};
