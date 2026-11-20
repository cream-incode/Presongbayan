import { Router } from 'express' // groups the endpoints so index.ts can plug them in.
import { MySqlCatalogRepository } from '../repositories/catalog.repository' // the real db class. this file is the only place that picks it.
import { ProductCatalogService } from '../services/catalog.service' // the catalog rules.
import { createCatalogController } from '../controllers/catalog.controller' // builds the handlers.

const router = Router() // a fresh router for the catalog.

const repository = new MySqlCatalogRepository() // one db object.
const controller = createCatalogController(new ProductCatalogService(repository)) // DIP wiring: repository into the service, service into the controller.

// no requireAuth on purpose. these are read-only and only show approved products, so customers can browse and compare prices without logging in. add requireAuth here if your team wants them logged in.
router.get('/products', controller.list) // GET /api/catalog/products gives the approved products, with optional filters.
router.get('/products/:id', controller.getOne) // GET /api/catalog/products/7 gives one approved product.

export default router // exported so index.ts can mount it.
