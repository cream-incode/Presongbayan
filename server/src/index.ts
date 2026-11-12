import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { db } from "./db";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json()); // lets us read JSON from request bodies

// quick test route to check the server AND the database are both alive
app.get("/api/health", async (_req, res) => {
	const [rows] = await db.query("SELECT 1 AS ok");
	res.json({ status: "running", db: rows });
});

app.listen(process.env.PORT, () => {
	console.log(`Server running on port ${process.env.PORT}`);
});
