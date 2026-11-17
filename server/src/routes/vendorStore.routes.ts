import { Router } from "express"; // lets us group the endpoints in one file and plug them into the app later.
import { requireAuth } from "../middleware/auth"; // your existing auth middleware. we use it to allow vendors only.
import { MySqlStallRepository } from "../repositories/stall.repository"; // the real stall db class. this file is the only place that picks it.
import { MySqlProductRepository } from "../repositories/product.repository"; // same for products.
import { StallService } from "../services/stall.service"; // stall rules.
import { ProductService } from "../services/product.service"; // product rules.
import { createStallController } from "../controllers/stall.controller"; // builds the stall handlers.
import { createProductController } from "../controllers/product.controller"; // builds the product handlers.

const router = Router(); // a new router just for the vendor's store stuff.

const stallRepository = new MySqlStallRepository(); // one instance of the db class. it fills both the reader and writer slots below.
const stallController = createStallController(
	new StallService(stallRepository, stallRepository),
); // DIP wiring: repository goes into the service and the service goes into the controller.

const productRepository = new MySqlProductRepository(); // same idea for products.
const productController = createProductController(
	new ProductService(productRepository, productRepository),
); // same wiring chain.

router.use(requireAuth("vendor")); // every route below needs a logged-in vendor. admins and customers get blocked by your middleware.

router.get("/stalls", stallController.list); // GET /api/vendor-store/stalls gives the vendor's stalls.
router.post("/stalls", stallController.create); // POST adds a stall.
router.put("/stalls/:id", stallController.update); // PUT edits the stall with that id.
router.delete("/stalls/:id", stallController.remove); // DELETE removes it.

router.get("/products", productController.list); // GET /api/vendor-store/products gives all the vendor's products.
router.post("/products", productController.create); // POST adds a product to one of their stalls.
router.put("/products/:id", productController.update); // PUT edits product details, but not the price.
router.delete("/products/:id", productController.remove); // DELETE removes the product.

export default router; // exported so index.ts can mount it.
