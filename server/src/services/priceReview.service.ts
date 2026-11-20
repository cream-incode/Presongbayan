import { IPriceUpdateByStatusReader, IPriceUpdateReviewer, PriceUpdate, ReviewStatus } from '../types/priceUpdate.types' // only interfaces again. the admin side needs just a status reader and a reviewer.
import { ServiceError } from './vendorApproval.service' // our shared error class with a status code.

// OCP: if you ever want another decision, add it to this list and the logic below stays the same.
const ALLOWED_DECISIONS: ReviewStatus[] = ['approved', 'rejected']

// the statuses the admin is allowed to filter the list by. it keeps random query strings from reaching the database.
const LIST_STATUSES: ReviewStatus[] = ['pending', 'approved', 'rejected']

// SRP: this service only handles the admin's review of prices.
export class PriceReviewService {
  constructor(
    private reader: IPriceUpdateByStatusReader, // DIP: gets passed in.
    private reviewer: IPriceUpdateReviewer // same, the MySQL class fills both slots.
  ) {}

  list(status: ReviewStatus): Promise<PriceUpdate[]> {
    if (!LIST_STATUSES.includes(status)) throw new ServiceError('Invalid status filter.', 400) // rejects anything that isn't one of the 3 statuses. 400 means the request was bad.
    return this.reader.findByStatus(status) // gets the submissions with that status.
  }

  async decide(id: number, adminId: number, decision: ReviewStatus): Promise<void> {
    if (!ALLOWED_DECISIONS.includes(decision)) throw new ServiceError('Decision must be approved or rejected.', 400) // the admin can't push something back to pending through this.
    const reviewed = await this.reviewer.review(id, adminId, decision) // does the update. on approval the repository also changes the product's price in the same transaction.
    if (!reviewed) throw new ServiceError('Submission not found or already reviewed.', 404) // 404 for a wrong id or one that was already decided.
  }
}
