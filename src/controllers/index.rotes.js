import { pool } from "../db.js";

export const index = (req, res) => res.json({ message: "welcome to my api" });

export const ping = async (req, res) => {
  const [result] = await pool.query('SELECT "pong" as result');
  console.log("Conectado a la BD")
  res.json(result[0]);
};
