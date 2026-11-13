import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { db } from "./config/db";
import authRoutes from "./routes/auth.routes"; // the router file with POST /login. we need to import it before we can use it.

dotenv.config();
const app = express();

app.use(cors({ origin: "http://localhost:5173" })); // Vite's default port
app.use(express.json()); // without this, req.body is undefined
app.use("/api/auth", authRoutes); // makes the URLs /api/auth/login, /register, /me

// quick test route to check the server AND the database are both alive
app.get("/api/health", async (_req, res) => {
	const [rows] = await db.query("SELECT 1 AS ok");
	res.json({ status: "running", db: rows });
});

app.listen(process.env.PORT, () => {
	console.log(`Server running on port ${process.env.PORT}`);
});

	  