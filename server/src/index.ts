import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { db } from "./config/db";
import authRoutes from "./routes/auth.routes"; // the router file with POST /login. we need to import it before we can use it.
import vendorRoutes from './routes/vendor.routes' // pulls in the vendor endpoints.
import vendorStoreRoutes from './routes/vendorStore.routes' // stall and product endpoints.

dotenv.config();
const app = express();

app.use(cors({ origin: "http://localhost:5173" })); // Vite's default port
app.use(express.json()); // without this, req.body is undefined
app.use("/api/auth", authRoutes); // makes the URLs /api/auth/login, /register, /me
app.use('/api/vendors', vendorRoutes) // admin approves or rejects vendors here.
app.use('/api/vendor-store', vendorStoreRoutes) // vendor manages their stalls and products here.

// quick test route to check the server AND the database are both alive
app.get("/api/health", async (_req, res) => {
	const [rows] = await db.query("SELECT 1 AS ok");
	res.json({ status: "running", db: rows });
});

app.listen(process.env.PORT, () => {
	console.log(`Server running on port ${process.env.PORT}`);
});

app.use('/api/vendors', vendorRoutes) // puts them under /api/vendors.