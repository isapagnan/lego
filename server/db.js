import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB_NAME = 'lego';

let client = null;
let db = null;

export const connect = async () => {
  if (db) return db;

  client = await MongoClient.connect(MONGODB_URI);
  db = client.db(MONGODB_DB_NAME);

  return db;
};

export const insert = async (collectionName, items) => {
  const db = await connect();
  const collection = db.collection(collectionName);
  return await collection.insertMany(items);
};

export const find = async (collectionName, query = {}) => {
  const db = await connect();
  const collection = db.collection(collectionName);
  return await collection.find(query).toArray();
};

export const close = async () => {
  if (client) {
    await client.close();
  }
};
