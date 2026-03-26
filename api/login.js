// api/login.js
import { getClient } from "./_db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

  const { firstName, lastName, password } = req.body;
  if (!firstName || !lastName || !password)
    return res.status(400).json({ error: "Missing fields" });

  try {
    const client = await getClient();
    const db = client.db("AssassinDB");

    const player = await db.collection("players").findOne({
      firstName: firstName.trim(),
      lastName: lastName.trim()
    });

    if (!player) return res.status(404).json({ success: false, error: "Player not found." });
    if (player.password !== password)
      return res.status(401).json({ success: false, error: "Incorrect password." });

    // Fetch team name if they have one
    let teamName = null;
    if (player.teamId) {
      const { ObjectId } = await import("mongodb");
      const team = await db.collection("teams").findOne({ _id: new ObjectId(player.teamId) });
      teamName = team?.name || null;
    }

    return res.status(200).json({ success: true, team: teamName });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}