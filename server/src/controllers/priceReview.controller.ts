import { Request, Response } from 'express' // types for req and res.
import { PriceReviewService } from '../services/priceReview.service' // the admin-side service.
import { ReviewStatus } from '../types/priceUpdate.types' // the pending/approved/rejected type, for casting what comes from the url and body.
import { getAdminId, sendError } from '../utils/requestHelpers' // getAdminId is the new helper you add to requestHelpers.ts. sendError is the one we already have.

// SRP: only http for the admin's review. DIP: the service is passed in from outside.
export function createPriceReviewController(service: PriceReviewService) {
  return {
    async list(req: Request, res: Response) {
      try {
        const status = (req.query.status as ReviewStatus) || 'pending' // reads ?status=... and defaults to pending, which is what the review queue needs. the cast is just for TypeScript.
        const submissions = await service.list(status) // asks the service. it rejects weird status values.
        res.json({ submissions }) // each item has the product name, vendor name, current price and proposed price.
      } catch (error) {
        sendError(res, error, 'Could not load submissions.') // picks the right status code.
      }
    },

    async decide(req: Request, res: Response) {
      try {
        const { decision } = req.body as { decision: ReviewStatus } // the admin's choice, approved or rejected.
        await service.decide(Number(req.params.id), getAdminId(req), decision) // the admin id comes from the token so it's recorded as the reviewer.
        res.json({ message: `Submission ${decision}.` }) // like "Submission approved."
      } catch (error) {
        sendError(res, error, 'Could not review the submission.') // a 400 for a bad decision, a 404 if it's missing or already reviewed.
      }
    },
  }
}
