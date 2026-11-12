import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config(); // loads the .env values

// pool = reuses connections instead of opening a new one every query
export const db = mysql.createPool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
});
