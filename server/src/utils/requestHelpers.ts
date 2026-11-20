import { Request, Response } from "express"; // the types for req and res. they give us autocomplete and type checks.
import { ServiceError } from "../services/vendorApproval.service"; // our error class that carries a status code. we check for it below.

// pulls the logged-in vendor's id out of the request. ASSUMPTION: your requireAuth puts the decoded token at req.user with an id field, so change this one line if yours is different.
export function getVendorId(req: Request): number {
	return Number((req as any).user?.id); // (req as any) because Express's Request type doesn't know about .user. the ?. avoids a crash if it's missing.
}

// same idea as getVendorId but for the admin routes. ASSUMPTION: requireAuth('admin') puts the decoded token on req.user with an id field too.
export function getAdminId(req: Request): number {
	return Number((req as any).user?.id); // reads the logged-in admin's id from the token. the ?. avoids a crash when user is missing.
}

// one place for turning errors into http responses so the controllers don't repeat this. we keep it in utils so the controllers stay short.
export function sendError(res: Response, error: unknown, fallback: string) {
	if (error instanceof ServiceError) {
		// our own expected errors like 400 or 404.
		res.status(error.statusCode).json({ message: error.message }); // uses the code and message the service gave us.
		return; // stops here so we don't send a second response.
	}

	const code = (error as { code?: string })?.code; // mysql2 errors have a code string like ER_NO_REFERENCED_ROW_2. we read it to give friendlier messages.

	if (code === "ER_NO_REFERENCED_ROW_2") {
		// the foreign key points to something that doesn't exist, like a wrong market_id or category_id.
		res
			.status(400)
			.json({ message: "The selected market or category does not exist." }); // 400 because the client sent a bad id.
		return; // done, don't fall through.
	}

	if (code === "ER_ROW_IS_REFERENCED_2") {
		// we tried to delete a row that other tables still use, like a stall that still has products.
		res
			.status(409)
			.json({
				message: "This record is still being used, so it cannot be deleted.",
			}); // 409 means conflict with the current state.
		return; // done again.
	}

	res.status(500).json({ message: fallback }); // anything else is unexpected so we send the generic message. the real error stays out of the response.
}
