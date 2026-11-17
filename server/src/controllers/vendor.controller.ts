import { Request, Response } from "express"; // Request and Response are the types for the req and res params. they give us autocomplete and type checks.
import {
	ServiceError,
	VendorApprovalService,
} from "../services/vendorApproval.service"; // the service we'll call plus its error class. the controller needs the error class to read the status code.
import { ApprovalStatus } from "../types/vendor.types"; // we need this type to cast what comes from the query string and body.

// SRP: the controller only translates http into service calls and back. the rules stay in the service.
export function createVendorController(service: VendorApprovalService) {
	// DIP: the service gets passed in from outside, so the controller never builds its own.
	return {
		async list(req: Request, res: Response) {
			const status = (req.query.status as ApprovalStatus) || "pending"; // reads ?status=... from the url and defaults to pending. the cast is just for TypeScript.

			try {
				const vendors = await service.listByStatus(status); // asks the service for the vendors. it handles the rest.
				res.json({ vendors }); // sends them back in an object so we can add more fields later without breaking the frontend.
			} catch {
				res.status(500).json({ message: "Could not load vendors." }); // if the db blows up we send a generic message. we don't want to leak the real error.
			}
		},

		async decide(req: Request, res: Response) {
			const id = Number(req.params.id); // url params are always strings so we turn it into a number. the db column is an int.
			const { status } = req.body as { status: ApprovalStatus }; // grabs the admin's decision from the json body. same cast idea as above.

			try {
				await service.decide(id, status); // runs the approve/reject rules. it throws if something's wrong.
				res.json({ message: `Vendor ${status}.` }); // tells the frontend it worked, like "Vendor approved."
			} catch (error) {
				if (error instanceof ServiceError) {
					// checks if it's one of our expected errors like 400 or 404.
					res.status(error.statusCode).json({ message: error.message }); // uses the code and message the service gave us.
					return; // stops here so we don't also send the 500 below.
				}
				res.status(500).json({ message: "Could not update vendor." }); // anything else is unexpected so we send a generic 500.
			}
		},
	};
}
