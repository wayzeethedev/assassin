// api/submit.js
import { MongoClient } from "mongodb";

let cachedClient = null;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  const { player, code } = req.body;

  if (!player || !code) {
    return res.status(400).json({ error: "Missing player or code" });
  }

  try {
    // Connect to MongoDB (cache connection)
    if (!cachedClient) {
      cachedClient = new MongoClient(process.env.MONGO_URI);
      await cachedClient.connect();
    }

    const db = cachedClient.db("AssassinDB");       // your database
    const collection = db.collection("codes");      // your collection

    const result = await collection.insertOne({
      player,
      code,
      createdAt: new Date()
    });

    return res.status(200).json({ success: true, id: result.insertedId });
  } catch (err) {
    console.error("MongoDB Error:", err); // <-- logs exact error
    return res.status(500).json({ success: false, error: err.message });
  }
}