import {
	IProductReviewer,
	IProductSubmissionReader,
	ProductSubmission,
} from "../types/productReview.types"; // only interfaces, never the MySQL class. that's DIP.
import { ApprovalStatus } from "../types/vendor.types"; // the status type.
import { ServiceError } from "./vendorApproval.service"; // our shared error class that carries a status code.

// OCP: to allow another decision later, add it here and the logic below stays the same.
const ALLOWED_DECISIONS: ApprovalStatus[] = ["approved", "rejected"];

// the statuses the admin may filter by. it stops random query strings from reaching the database.
const LIST_STATUSES: ApprovalStatus[] = ["pending", "approved", "rejected"];

// SRP: this service holds only the admin's product review rules. no sql and no req/res.
export class ProductReviewService {
	constructor(
		private reader: IProductSubmissionReader, // DIP: passed in from the routes file.
		private reviewer: IProductReviewer, // same for the deciding half. the real MySQL class fills both slots.
	) {}

	list(status: ApprovalStatus): Promise<ProductSubmission[]> {
		if (!LIST_STATUSES.includes(status))
			throw new ServiceError("Invalid status filter.", 400); // rejects anything that isn't one of the 3 statuses. 400 means the request was bad.
		return this.reader.findByStatus(status); // gets the products with that status.
	}

	async decide(
		id: number,
		adminId: number,
		decision: ApprovalStatus,
	): Promise<void> {
		if (!Number.isInteger(id) || id <= 0)
			throw new ServiceError("Invalid product id.", 400); // the id from the url must be a positive whole number.
		if (!ALLOWED_DECISIONS.includes(decision))
			throw new ServiceError("Decision must be approved or rejected.", 400); // the admin can't push a product back to pending through this.
		const reviewed = await this.reviewer.review(id, adminId, decision); // saves the decision. true if it worked.
		if (!reviewed)
			throw new ServiceError("Product not found or already reviewed.", 404); // 404 for a wrong id or one that was already decided.
	}
}
