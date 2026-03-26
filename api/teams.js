// api/teams.js
import { getClient } from "./_db.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Use GET" });

  try {
    const client = await getClient();
    const db = client.db("AssassinDB");

    const teams = await db.collection("teams").find({}).toArray();

    // Attach player counts
    const teamsWithCounts = await Promise.all(
      teams.map(async (team) => {
        const count = await db.collection("players").countDocuments({
          teamId: team._id.toString()
        });
        return { ...team, count };
      })
    );

    return res.status(200).json({ teams: teamsWithCounts });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}