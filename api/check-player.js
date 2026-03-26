// api/check-player.js
import { getClient } from "./_db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

  const { firstName, lastName } = req.body;
  if (!firstName || !lastName) return res.status(400).json({ error: "Missing name" });

  try {
    const client = await getClient();
    const db = client.db("AssassinDB");
    const player = await db.collection("players").findOne({
      firstName: firstName.trim(),
      lastName: lastName.trim()
    });

    return res.status(200).json({ exists: !!player });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}