import { Router } from "express"; // groups the endpoints so index.ts can plug them in.
import { requireAuth } from "../middleware/auth"; // your auth middleware. we pass 'admin' so only admins get in.
import { MySqlProductReviewRepository } from "../repositories/productReview.repository"; // the real db class. this file is the only place that picks it.
import { ProductReviewService } from "../services/productReview.service"; // the review rules.
import { createProductReviewController } from "../controllers/productReview.controller"; // builds the handlers.

const router = Router(); // a fresh router for the product review endpoints.

const repository = new MySqlProductReviewRepository(); // one db object. it fills both the reader and reviewer slots because the class implements both interfaces.
const controller = createProductReviewController(
	new ProductReviewService(repository, repository),
); // DIP wiring: repository into the service, service into the controller.

router.use(requireAuth("admin")); // every route below is admin only. vendors and customers get blocked by your middleware.

router.get("/", controller.list); // GET /api/product-reviews?status=pending gives the review queue.
router.patch("/:id/review", controller.decide); // PATCH /api/product-reviews/5/review with { decision: 'approved' } saves the decision.

export default router; // exported so index.ts can mount it.
