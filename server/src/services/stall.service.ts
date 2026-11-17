import {
	IStallReader,
	IStallWriter,
	Stall,
	StallInput,
} from "../types/stall.types"; // only interfaces get imported, never the MySQL class. that's DIP in action.
import { ServiceError } from "./vendorApproval.service"; // reusing the error class we made for vendor approval. it carries the http status code.

type Rule = (input: StallInput) => string | null; // a rule gets the input and returns an error text, or null if it's fine. keeping rules in one shape makes them easy to add.

// OCP: to add another stall rule you just add a line here. the validate function underneath doesn't change.
const STALL_RULES: Rule[] = [
	(input) =>
		Number.isInteger(input.marketId) && input.marketId > 0
			? null
			: "Pick a valid market.", // marketId must be a positive whole number. this catches empty or text values early.
	(input) =>
		input.stallName && input.stallName.trim()
			? null
			: "Stall name is required.", // blocks empty or spaces-only names. the && first makes sure it isn't undefined before .trim().
];

function validate(input: StallInput) {
	for (const rule of STALL_RULES) {
		// goes through every rule in order.
		const error = rule(input); // runs the rule and gets null or a message.
		if (error) throw new ServiceError(error, 400); // stops at the first problem with a 400 (bad request).
	}
}

// SRP: this class holds the stall rules only. no sql and no req/res.
export class StallService {
	constructor(
		private reader: IStallReader, // DIP: the reader is passed in. in tests we can pass a fake one.
		private writer: IStallWriter, // same for the writer. the real MySQL class fills both slots.
	) {}

	list(vendorId: number): Promise<Stall[]> {
		return this.reader.findByVendor(vendorId); // no extra rules for listing, so we just pass it on.
	}

	async create(vendorId: number, input: StallInput): Promise<number> {
		validate(input); // checks the input first. it throws if something's wrong.
		return this.writer.create(vendorId, {
			...input,
			stallName: input.stallName.trim(),
		}); // saves with the name trimmed so " Stall 1 " becomes "Stall 1".
	}

	async update(id: number, vendorId: number, input: StallInput): Promise<void> {
		validate(input); // same checks as create.
		const updated = await this.writer.update(id, vendorId, {
			...input,
			stallName: input.stallName.trim(),
		}); // true if a row changed.
		if (!updated) throw new ServiceError("Stall not found.", 404); // not found or not theirs. we say the same thing for both so we don't reveal other vendors' ids.
	}

	async remove(id: number, vendorId: number): Promise<void> {
		const removed = await this.writer.remove(id, vendorId); // tries to delete it.
		if (!removed) throw new ServiceError("Stall not found.", 404); // same 404 idea as above.
	}
}
