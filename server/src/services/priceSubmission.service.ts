import { IPriceUpdateByVendorReader, IPriceUpdateSubmitter, PriceUpdate } from '../types/priceUpdate.types' // only interfaces, never the MySQL class. that's DIP, the service doesn't know which database is used.
import { ServiceError } from './vendorApproval.service' // same error class as the other services. it carries the http status code.

type Rule = (input: { productId?: number; proposedPrice: number }) => string | null // a rule returns an error text or null. one shape so rules are easy to add.

// OCP: new price rules go into this list. the check function below doesn't change.
const PRICE_RULES: Rule[] = [
  (input) => (Number.isFinite(input.proposedPrice) && input.proposedPrice > 0 ? null : 'Price must be greater than 0.'), // blocks NaN, Infinity, zero and negatives. isFinite catches the weird ones.
  (input) => (input.proposedPrice <= 100000 ? null : 'Price looks too high. Please check it.'), // a simple sanity cap so a typo like an extra zero gets caught. change the number to fit your products.
]

function check(productId: number | undefined, proposedPrice: number) {
  for (const rule of PRICE_RULES) { // runs every rule in order.
    const error = rule({ productId, proposedPrice }) // gets null or a message.
    if (error) throw new ServiceError(error, 400) // stops at the first problem with a 400.
  }
}

// SRP: this service is the vendor's side only. admin review lives in its own service.
export class PriceSubmissionService {
  constructor(
    private reader: IPriceUpdateByVendorReader, // DIP: passed in, not created here.
    private submitter: IPriceUpdateSubmitter // same for the writer. the real MySQL class fills both slots.
  ) {}

  listMine(vendorId: number): Promise<PriceUpdate[]> {
    return this.reader.findByVendor(vendorId) // nothing to check, just pass it through.
  }

  async submit(vendorId: number, productId: number, proposedPrice: number): Promise<number> {
    if (!Number.isInteger(productId) || productId <= 0) throw new ServiceError('Pick a valid product.', 400) // the product id must be a positive whole number.
    check(productId, proposedPrice) // checks the price rules.
    const id = await this.submitter.create(vendorId, productId, proposedPrice) // saves it. we get 0 back when the product isn't theirs.
    if (id === 0) throw new ServiceError('Product not found.', 404) // we say "not found" so we don't reveal other vendors' product ids.
    return id // the new submission id.
  }

  async changePrice(id: number, vendorId: number, proposedPrice: number): Promise<void> {
    check(undefined, proposedPrice) // same price rules. there's no productId here since only the price can change.
    const updated = await this.submitter.updatePending(id, vendorId, proposedPrice) // true if it changed.
    if (!updated) throw new ServiceError('Submission not found or already reviewed.', 404) // covers wrong id, someone else's, or already decided.
  }

  async cancel(id: number, vendorId: number): Promise<void> {
    const removed = await this.submitter.removePending(id, vendorId) // tries to delete it.
    if (!removed) throw new ServiceError('Submission not found or already reviewed.', 404) // same reasons as above.
  }
}
