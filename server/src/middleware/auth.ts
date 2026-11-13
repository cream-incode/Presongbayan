import { Request, Response, NextFunction } from "express"; // types for a middleware function. next is what passes the request along.
import jwt from "jsonwebtoken"; // used to verify the token the frontend sends.

// protects a route. pass the roles that are allowed, e.g. requireAuth("vendor", "admin").
export const requireAuth =
	(...allowed: string[]) =>
	(req: Request, res: Response, next: NextFunction) => {
		const header = req.headers.authorization; // the frontend sends "Bearer <token>" here.
		const token = header?.startsWith("Bearer ") ? header.slice(7) : null; // cut off "Bearer " to get just the token. null if the header is missing.

		if (!token) return res.status(401).json({ message: "No token provided." }); // not logged in.

		try {
			// jwt.verify throws if the token is fake or expired.
			const payload = jwt.verify(token, process.env.JWT_SECRET as string) as {
				id: number;
				role: string;
			}; // checks the signature and gives back what we put in it.
			if (allowed.length && !allowed.includes(payload.role)) {
				// if we listed roles, the user's role has to be one of them.
				return res
					.status(403)
					.json({ message: "You don't have access to this." }); // logged in but the wrong role.
			}
			(req as any).user = payload; // attach the user to the request so the route handlers can use req.user.
			next(); // all good, move on to the actual route.
		} catch {
			return res.status(401).json({ message: "Invalid or expired token." }); // bad token.
		}
	};
