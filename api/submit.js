import { MongoClient } from "mongodb";

let cachedClient = null;

async function getClient() {
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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  const { player, code } = req.body;

  if (!player || !code) {
    return res.status(400).json({ error: "Missing player or code" });
  }

  try {
    const client = await getClient();
    const db = client.db("AssassinDB");
    const collection = db.collection("codes");

    const result = await collection.insertOne({
      player,
      code,
      createdAt: new Date()
    });

    return res.status(200).json({ success: true, id: result.insertedId });
  } catch (err) {
    console.error("MongoDB Error:", err);
    cachedClient = null;
    return res.status(500).json({ success: false, error: err.message });
  }
}