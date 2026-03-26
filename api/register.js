// api/register.js
import { getClient } from "./_db.js";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

  const { firstName, lastName, password, grade, teamId, newTeamName } = req.body;

  if (!firstName || !lastName || !password || !grade)
    return res.status(400).json({ error: "Missing required fields." });

  try {
    const client = await getClient();
    const db = client.db("AssassinDB");

    // Double-check player doesn't already exist
    const existing = await db.collection("players").findOne({
      firstName: firstName.trim(),
      lastName: lastName.trim()
    });
    if (existing) return res.status(409).json({ success: false, error: "Player already registered." });

    let resolvedTeamId;
    let resolvedTeamName;

    if (newTeamName) {
      // Create new team
      const teamResult = await db.collection("teams").insertOne({
        name: newTeamName.trim(),
        createdAt: new Date()
      });
      resolvedTeamId = teamResult.insertedId;
      resolvedTeamName = newTeamName.trim();
    } else {
      // Join existing team — verify it's not full
      const team = await db.collection("teams").findOne({ _id: new ObjectId(teamId) });
      if (!team) return res.status(404).json({ success: false, error: "Team not found." });

      const memberCount = await db.collection("players").countDocuments({ teamId: teamId.toString() });
      if (memberCount >= 5)
        return res.status(400).json({ success: false, error: "That team is full." });

      resolvedTeamId = team._id;
      resolvedTeamName = team.name;
    }

    // Insert player
    await db.collection("players").insertOne({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      password, // NOTE: store hashed in production — plain text fine for a school game
      grade,
      teamId: resolvedTeamId.toString(),
      createdAt: new Date()
    });

    return res.status(200).json({ success: true, team: resolvedTeamName });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}