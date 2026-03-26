// api/validate-code.js
export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

  const { code } = req.body;
  const valid = code && code.trim() === process.env.GAME_CODE;

  return res.status(200).json({ valid: !!valid });
}