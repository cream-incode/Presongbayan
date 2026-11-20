import { ApprovalStatus } from "./vendor.types"; // reusing the pending/approved/rejected type we already made. no point writing it twice.

// what the admin sees when double checking a product. everything is joined in so the admin page needs no extra calls.
export interface ProductSubmission {
	id: number; // the product's id. we send it back when the admin approves or rejects.
	productName: string; // like "Regular Rice".
	brand: string; // empty string if the vendor left it blank.
	packageSize: number; // how much is in one pack.
	unit: string; // unit for that size, like kg.
	price: number; // the starting price the vendor set.
	categoryName: string; // joined from product_category, so the admin can check it's in the right category.
	stallName: string; // joined from stall.
	marketName: string; // joined from market, so the admin knows where it's sold.
	vendorName: string; // joined from vendor, so the admin knows who submitted it.
	approvalStatus: ApprovalStatus; // pending, approved or rejected.
	submittedAt: string; // when the vendor added it. it's the product's created_at.
	reviewedAt: string | null; // when the admin decided. null while pending.
}

// ISP: two small interfaces. the service only needs the reading half and the deciding half, and they could even be different classes.
export interface IProductSubmissionReader {
	findByStatus(status: ApprovalStatus): Promise<ProductSubmission[]>; // gets all submitted products with that status. the admin queue uses pending.
}

export interface IProductReviewer {
	review(
		id: number,
		adminId: number,
		decision: ApprovalStatus,
	): Promise<boolean>; // saves the admin's decision. false if the product doesn't exist or was already reviewed.
}
