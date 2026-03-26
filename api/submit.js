// api/submit.js
import { MongoClient } from "mongodb";

let cachedClient = null;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Use POST");
  }

  const { player, code } = req.body;

  if (!player || !code) {
    return res.status(400).json({ error: "Missing player or code" });
  }

  // Connect to MongoDB
  if (!cachedClient) {
    cachedClient = new MongoClient(process.env.MONGO_URI);
    await cachedClient.connect();
  }

  const db = cachedClient.db("AssassinDB");       // your database name
  const collection = db.collection("codes");      // your collection name

  const result = await collection.insertOne({ player, code, createdAt: new Date() });

  res.status(200).json({ success: true, id: result.insertedId });
}