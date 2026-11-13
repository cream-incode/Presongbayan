import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { db } from "../config/db"; // mysql2/promise pool, same one login uses

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function register(req: Request, res: Response) {
	try {
		const { fullName, email, password, role } = req.body;

		// basic validation (confirmPassword is checked on the frontend only)
		if (!fullName || !email || !password || !role) {
			return res.status(400).json({ message: "All fields are required." });
		}
		if (!EMAIL_REGEX.test(email)) {
			return res.status(400).json({ message: "Invalid email address." });
		}
		if (password.length < 8) {
			return res
				.status(400)
				.json({ message: "Password must be at least 8 characters." });
		}
		// admin accounts can never be created from the public form
		if (role !== "customer" && role !== "vendor") {
			return res.status(400).json({ message: "Invalid account type." });
		}

		const normalizedEmail = String(email).trim().toLowerCase();

		// email must be unique across ALL three account tables,
		// since login checks admin -> vendor -> customer by email only
		const [existing]: any = await db.query(
			`SELECT email FROM admin WHERE email = ?
       UNION SELECT email FROM vendor WHERE email = ?
       UNION SELECT email FROM customer WHERE email = ?`,
			[normalizedEmail, normalizedEmail, normalizedEmail],
		);
		if (existing.length > 0) {
			return res.status(409).json({ message: "Email is already registered." });
		}

		const passwordHash = await bcrypt.hash(password, 10);
		const name = String(fullName).trim();

		if (role === "vendor") {
			// vendors start as pending until an admin approves them
			await db.query(
				`INSERT INTO vendor (full_name, email, password_hash, approval_status)
         VALUES (?, ?, ?, 'pending')`,
				[name, normalizedEmail, passwordHash],
			);
			return res.status(201).json({
				message:
					"Vendor account created. Please wait for admin approval before logging in.",
			});
		}

		await db.query(
			`INSERT INTO customer (full_name, email, password_hash)
       VALUES (?, ?, ?)`,
			[name, normalizedEmail, passwordHash],
		);
		return res
			.status(201)
			.json({ message: "Account created. You can now log in." });
	} catch (error) {
		console.error("Register error:", error);
		return res.status(500).json({ message: "Something went wrong." });
	}
}
