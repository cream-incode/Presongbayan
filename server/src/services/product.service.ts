import {
	IProductReader,
	IProductWriter,
	Product,
	ProductCreateInput,
	ProductFields,
	ProductUpdateInput,
} from "../types/product.types"; // only types and interfaces, no MySQL class. the service never knows which database is behind it.
import { ServiceError } from "./vendorApproval.service"; // same error class as the other services. it carries the http status code.

type Rule<T> = (input: T) => string | null; // generic rule: takes some input and returns an error text or null. one shape works for both the shared rules and the create-only rules.

// OCP: to add a new product rule you add a line to one of these lists. runRules below stays the same.
const FIELD_RULES: Rule<ProductFields>[] = [
	(input) =>
		Number.isInteger(input.categoryId) && input.categoryId > 0
			? null
			: "Pick a valid category.", // categoryId has to be a positive whole number.
	(input) =>
		input.name && input.name.trim() ? null : "Product name is required.", // no empty names. the first check stops .trim() from crashing on undefined.
	(input) =>
		Number(input.packageSize) > 0
			? null
			: "Package size must be greater than 0.", // Number() so a string like "1.5" still works. zero or negative sizes make no sense.
	(input) => (input.unit && input.unit.trim() ? null : "Unit is required."), // the unit can't be blank, like kg or piece.
];

// rules that only matter when creating. updating can't change the stall or the price, so these don't apply there.
const CREATE_RULES: Rule<ProductCreateInput>[] = [
	(input) =>
		Number.isInteger(input.stallId) && input.stallId > 0
			? null
			: "Pick one of your stalls.", // stallId has to be a positive whole number.
	(input) =>
		Number.isFinite(Number(input.currentPrice)) &&
		Number(input.currentPrice) >= 0
			? null
			: "Price must be 0 or higher.", // blocks NaN and negative prices. isFinite also rejects Infinity.
];

function runRules<T>(rules: Rule<T>[], input: T) {
	for (const rule of rules) {
		// checks each rule in order.
		const error = rule(input); // gets null or a message.
		if (error) throw new ServiceError(error, 400); // stops at the first problem with a 400.
	}
}

function clean<T extends ProductFields>(input: T): T {
	return {
		...input,
		name: input.name.trim(),
		brand: (input.brand ?? "").trim(),
		unit: input.unit.trim(),
	}; // trims the text fields and turns a missing brand into ''. the spread keeps all the other fields as they were.
}

// SRP: this class holds product rules only. no sql and no req/res.
export class ProductService {
	constructor(
		private reader: IProductReader, // DIP: the reader gets passed in, not created here.
		private writer: IProductWriter, // same for the writer.
	) {}

	list(vendorId: number): Promise<Product[]> {
		return this.reader.findByVendor(vendorId); // nothing to check when listing, so we pass it straight through.
	}

	async create(vendorId: number, input: ProductCreateInput): Promise<number> {
		runRules(FIELD_RULES, input); // checks the shared fields first. it throws on a problem.
		runRules(CREATE_RULES, input); // then the create-only fields.
		const id = await this.writer.create(vendorId, clean(input)); // saves the cleaned version. we get 0 back if the stall isn't theirs.
		if (id === 0) throw new ServiceError("Stall not found.", 404); // 0 means no insert happened. we say "not found" so we don't leak other vendors' stall ids.
		return id; // the new product id.
	}

	async update(
		id: number,
		vendorId: number,
		input: ProductUpdateInput,
	): Promise<void> {
		runRules(FIELD_RULES, input); // same shared checks.
		const updated = await this.writer.update(id, vendorId, clean(input)); // true if a row changed.
		if (!updated) throw new ServiceError("Product not found.", 404); // not found or not theirs.
	}

	async remove(id: number, vendorId: number): Promise<void> {
		const removed = await this.writer.remove(id, vendorId); // tries the delete.
		if (!removed) throw new ServiceError("Product not found.", 404); // same 404 idea.
	}
}
