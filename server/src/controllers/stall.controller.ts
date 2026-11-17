import { Request, Response } from "express"; // types for req and res.
import { StallService } from "../services/stall.service"; // the service that does the real work. the controller only calls it.
import { StallInput } from "../types/stall.types"; // the shape of the request body for create and update.
import { getVendorId, sendError } from "../utils/requestHelpers"; // helper to get the vendor id from the token, and one to turn errors into responses.

// SRP: this controller only turns http requests into service calls and back. DIP: the service gets passed in from the routes file.
export function createStallController(service: StallService) {
	return {
		async list(req: Request, res: Response) {
			try {
				const stalls = await service.list(getVendorId(req)); // gets only this vendor's stalls. the id comes from the token, not from the client.
				res.json({ stalls }); // wrapped in an object so we can add fields later without breaking the frontend.
			} catch (error) {
				sendError(res, error, "Could not load stalls."); // the helper picks the right status code and message.
			}
		},

		async create(req: Request, res: Response) {
			try {
				const id = await service.create(
					getVendorId(req),
					req.body as StallInput,
				); // saves the stall for this vendor. req.body has marketId and stallName.
				res.status(201).json({ message: "Stall created.", id }); // 201 means created. we send the new id back too.
			} catch (error) {
				sendError(res, error, "Could not create stall."); // same error handling as above.
			}
		},

		async update(req: Request, res: Response) {
			try {
				await service.update(
					Number(req.params.id),
					getVendorId(req),
					req.body as StallInput,
				); // url params are strings so Number() makes the id a number.
				res.json({ message: "Stall updated." }); // tells the client it worked.
			} catch (error) {
				sendError(res, error, "Could not update stall."); // handles the 400 or 404 from the service.
			}
		},

		async remove(req: Request, res: Response) {
			try {
				await service.remove(Number(req.params.id), getVendorId(req)); // deletes only if the stall belongs to this vendor.
				res.json({ message: "Stall deleted." }); // tells the client it worked.
			} catch (error) {
				sendError(res, error, "Could not delete stall."); // a 409 shows up here if the stall still has products.
			}
		},
	};
}
