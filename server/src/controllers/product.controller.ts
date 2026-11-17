import { Request, Response } from "express"; // types for req and res.
import { ProductService } from "../services/product.service"; // the service with the product rules.
import { ProductCreateInput, ProductUpdateInput } from "../types/product.types"; // body shapes for create and update. they're different because update can't change the stall or price.
import { getVendorId, sendError } from "../utils/requestHelpers"; // same helpers as the stall controller.

// SRP: only http translation here. DIP: the service is passed in, so this file never builds its own.
export function createProductController(service: ProductService) {
	return {
		async list(req: Request, res: Response) {
			try {
				const products = await service.list(getVendorId(req)); // all products across this vendor's stalls.
				res.json({ products }); // wrapped in an object like the stalls response.
			} catch (error) {
				sendError(res, error, "Could not load products."); // picks the status code for us.
			}
		},

		async create(req: Request, res: Response) {
			try {
				const id = await service.create(
					getVendorId(req),
					req.body as ProductCreateInput,
				); // req.body has the stall, category, name, brand, size, unit, price and availability.
				res.status(201).json({ message: "Product created.", id }); // 201 means created, plus the new id.
			} catch (error) {
				sendError(res, error, "Could not create product."); // a 404 shows up if the stall isn't theirs.
			}
		},

		async update(req: Request, res: Response) {
			try {
				await service.update(
					Number(req.params.id),
					getVendorId(req),
					req.body as ProductUpdateInput,
				); // the id comes from the url and the new values from the body.
				res.json({ message: "Product updated." }); // confirms the update.
			} catch (error) {
				sendError(res, error, "Could not update product."); // handles 400 and 404 from the service.
			}
		},

		async remove(req: Request, res: Response) {
			try {
				await service.remove(Number(req.params.id), getVendorId(req)); // deletes only if the product sits in one of this vendor's stalls.
				res.json({ message: "Product deleted." }); // confirms the delete.
			} catch (error) {
				sendError(res, error, "Could not delete product."); // a 409 appears if other tables still point to the product, like shopping list items.
			}
		},
	};
}
