import { Request, Response } from "express"; // types for req and res.
import { ProductReviewService } from "../services/productReview.service"; // the service that does the real work.
import { ApprovalStatus } from "../types/vendor.types"; // the status type, for casting what comes from the url and body.
import { getAdminId, sendError } from "../utils/requestHelpers"; // getAdminId is the helper from the price updates step. sendError turns errors into responses.

// SRP: only http in and out. DIP: the service is passed in from the routes file.
export function createProductReviewController(service: ProductReviewService) {
	return {
		async list(req: Request, res: Response) {
			try {
				const status = (req.query.status as ApprovalStatus) || "pending"; // reads ?status=... and defaults to pending, which is what the review queue needs. the cast is just for TypeScript.
				const products = await service.list(status); // asks the service. it rejects weird status values.
				res.json({ products }); // each item has the full details so the admin can double check it.
			} catch (error) {
				sendError(res, error, "Could not load products for review."); // picks the right status code and message.
			}
		},

		async decide(req: Request, res: Response) {
			try {
				const { decision } = req.body as { decision: ApprovalStatus }; // the admin's choice, approved or rejected.
				await service.decide(Number(req.params.id), getAdminId(req), decision); // the admin id comes from the token so it's saved as the reviewer.
				res.json({ message: `Product ${decision}.` }); // like "Product approved."
			} catch (error) {
				sendError(res, error, "Could not review the product."); // a 400 for a bad decision, a 404 if it's missing or already reviewed.
			}
		},
	};
}
