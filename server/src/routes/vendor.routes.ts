import { Router } from "express"; // Router lets us group the vendor endpoints in one file. we plug the whole group into the app later.
import { requireAuth } from "../middleware/auth"; // your existing auth middleware. we use it so only admins can touch these routes.
import { MySqlVendorRepository } from "../repositories/vendor.repository"; // the real db class. this is the only file that picks it.
import { VendorApprovalService } from "../services/vendorApproval.service"; // the service with the approve/reject rules. we hand it the repository below.
import { createVendorController } from "../controllers/vendor.controller"; // factory that builds the controller. it needs a service to work.

const router = Router(); // makes a fresh router just for vendors. nothing is public yet.

const repository = new MySqlVendorRepository(); // creates the db class once. it's the only place where we choose MySQL.
const service = new VendorApprovalService(repository, repository); // same object fills both the reader and writer slots. that works because the class implements both interfaces.
const controller = createVendorController(service); // builds the handlers with our service inside. this is the "wiring" step of DIP.

router.get("/", requireAuth("admin"), controller.list); // GET /api/vendors?status=pending. requireAuth('admin') blocks everyone who isn't an admin.
router.patch("/:id/status", requireAuth("admin"), controller.decide); // PATCH /api/vendors/5/status with { status: 'approved' }. :id is the vendor row we're changing.

export default router; // exported so the main app file can mount it.
