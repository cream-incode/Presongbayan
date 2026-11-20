import { Router } from 'express' // groups the endpoints in one file so index.ts can plug them in.
import { requireAuth } from '../middleware/auth' // your auth middleware. we pass 'vendor' or 'admin' per route.
import { MySqlPriceUpdateRepository } from '../repositories/priceUpdate.repository' // the real db class. this file is the only place that picks it.
import { PriceSubmissionService } from '../services/priceSubmission.service' // vendor-side rules.
import { PriceReviewService } from '../services/priceReview.service' // admin-side rules.
import { createPriceSubmissionController } from '../controllers/priceSubmission.controller' // vendor handlers.
import { createPriceReviewController } from '../controllers/priceReview.controller' // admin handlers.

const router = Router() // a fresh router for price submissions.

const repository = new MySqlPriceUpdateRepository() // one db object. it fills every reader/writer slot below because the class implements all 4 interfaces.
const submissionController = createPriceSubmissionController(new PriceSubmissionService(repository, repository)) // DIP wiring for the vendor side: repository into the service, service into the controller.
const reviewController = createPriceReviewController(new PriceReviewService(repository, repository)) // same wiring for the admin side.

// vendor routes. requireAuth('vendor') blocks everyone who isn't a vendor.
router.get('/mine', requireAuth('vendor'), submissionController.listMine) // GET /api/price-updates/mine gives the vendor's own submissions.
router.post('/', requireAuth('vendor'), submissionController.submit) // POST sends a new price for review.
router.put('/:id', requireAuth('vendor'), submissionController.changePrice) // PUT edits the price of a pending submission.
router.delete('/:id', requireAuth('vendor'), submissionController.cancel) // DELETE cancels a pending submission.

// admin routes. requireAuth('admin') blocks everyone who isn't an admin.
router.get('/', requireAuth('admin'), reviewController.list) // GET /api/price-updates?status=pending gives the review queue.
router.patch('/:id/review', requireAuth('admin'), reviewController.decide) // PATCH approves or rejects, and an approval updates the product's price.

export default router // exported so index.ts can mount it.
