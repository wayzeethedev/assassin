// api/_db.js
import { MongoClient } from "mongodb";

let cachedClient = null;

export async function getClient() {
  if (cachedClient) {
    try {
      await cachedClient.db("admin").command({ ping: 1 });
      return cachedClient;
    } catch {
      cachedClient = null;
    }
  }

  cachedClient = new MongoClient(process.env.MONGO_URI);
  await cachedClient.connect();
  return cachedClient;
}