import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../config/db";

type Role = "admin" | "vendor" | "customer";

// checked in this order, same as before
const ACCOUNT_TABLES: { table: Role; role: Role }[] = [
	{ table: "admin", role: "admin" },
	{ table: "vendor", role: "vendor" },
	{ table: "customer", role: "customer" },
];

export async function login(req: Request, res: Response) {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res
				.status(400)
				.json({ message: "Email and password are required." });
		}

		const normalizedEmail = String(email).trim().toLowerCase();

		for (const { table, role } of ACCOUNT_TABLES) {
			// table names come from the constant list above, never from user input
			const [rows]: any = await db.query(
				`SELECT * FROM ${table} WHERE email = ? LIMIT 1`,
				[normalizedEmail],
			);

			if (rows.length === 0) continue;

			const account = rows[0];
			const passwordMatches = await bcrypt.compare(
				password,
				account.password_hash,
			);

			if (!passwordMatches) {
				return res.status(401).json({ message: "Invalid email or password." });
			}

			// vendors can only log in once an admin approved them
			if (role === "vendor" && account.approval_status !== "approved") {
				const message =
					account.approval_status === "rejected"
						? "Your vendor application was rejected."
						: "Your vendor account is still pending admin approval.";
				return res.status(403).json({ message });
			}

			const token = jwt.sign(
				{ id: account.id, role },
				process.env.JWT_SECRET as string,
				{
					expiresIn: "1d",
				},
			);

			return res.json({
				token,
				user: {
					id: account.id,
					fullName: account.full_name,
					email: account.email,
					role,
				},
			});
		}

		// no table had this email
		return res.status(401).json({ message: "Invalid email or password." });
	} catch (error) {
		console.error("Login error:", error);
		return res.status(500).json({ message: "Something went wrong." });
	}
}

export async function me(req: Request, res: Response) {
	try {
		// requireAuth puts the decoded token (id + role) on the request
		const { id, role } = (req as any).user;

		// only these three values are possible, so the table name is safe
		if (!["admin", "vendor", "customer"].includes(role)) {
			return res.status(403).json({ message: "Invalid role." });
		}

		const [rows]: any = await db.query(
			`SELECT * FROM ${role} WHERE id = ? LIMIT 1`,
			[id],
		);

		if (rows.length === 0) {
			return res.status(404).json({ message: "Account not found." });
		}

		const account = rows[0];

		return res.json({
			user: {
				id: account.id,
				fullName: account.full_name,
				email: account.email,
				role,
				...(role === "vendor" && { approvalStatus: account.approval_status }),
			},
		});
	} catch (error) {
		console.error("Me error:", error);
		return res.status(500).json({ message: "Something went wrong." });
	}
}
