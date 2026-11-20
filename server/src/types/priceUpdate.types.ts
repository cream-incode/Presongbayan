import { ApprovalStatus } from './vendor.types' // reusing the pending/approved/rejected type we already made. no need to write the same union twice.

export type ReviewStatus = ApprovalStatus // a price submission goes through the same 3 states as a vendor. giving it its own name makes the code easier to read.

// what we send to the frontend. it already has the product and vendor names joined in, so the pages don't need extra calls.
export interface PriceUpdate {
  id: number // the submission's id. used when the vendor edits or the admin reviews.
  productId: number // which product the price is for.
  productName: string // joined from product, like "Regular Rice".
  vendorName: string // joined from vendor. the admin page shows "Submitted by ...".
  unit: string // the product's unit like kg or piece.
  currentPrice: number // the live price right now. shown beside the proposed one so the admin can compare.
  proposedPrice: number // the new price the vendor wants.
  status: ReviewStatus // pending, approved or rejected.
  submittedAt: string // when the vendor submitted it.
  reviewedAt: string | null // when the admin decided. null while pending.
}

// ISP: four small interfaces instead of one big one. each service below only depends on the ones it really uses.
export interface IPriceUpdateByVendorReader {
  findByVendor(vendorId: number): Promise<PriceUpdate[]> // all submissions of one vendor. it's for the vendor's own page.
}

export interface IPriceUpdateByStatusReader {
  findByStatus(status: ReviewStatus): Promise<PriceUpdate[]> // every vendor's submissions with that status. it's for the admin queue.
}

export interface IPriceUpdateSubmitter {
  create(vendorId: number, productId: number, proposedPrice: number): Promise<number> // saves a new pending submission. it returns the new id, or 0 if the product isn't the vendor's.
  updatePending(id: number, vendorId: number, proposedPrice: number): Promise<boolean> // changes the price of an unreviewed submission. false if it's not found, not theirs or already reviewed.
  removePending(id: number, vendorId: number): Promise<boolean> // cancels an unreviewed submission. same false rules.
}

export interface IPriceUpdateReviewer {
  review(id: number, adminId: number, decision: ReviewStatus): Promise<boolean> // records the admin's decision, and on approval also updates the product's price. false if it's not found or was already reviewed.
}
