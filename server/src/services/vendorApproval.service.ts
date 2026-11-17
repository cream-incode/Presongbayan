import {
	ApprovalStatus,
	IVendorReader,
	IVendorWriter,
	Vendor,
} from "../types/vendor.types"; // we only import the interfaces, not the MySQL class. that's the whole point of DIP, the service doesn't care what database is behind it.

// custom error that carries an http status code. the controller reads it so the service doesn't have to know anything about res.status().
export class ServiceError extends Error {
	constructor(
		message: string,
		public statusCode: number,
	) {
		// "public statusCode" auto-creates the property. it saves us from writing this.statusCode = statusCode ourselves.
		super(message); // passes the message to the normal Error class. without this the error would have no text.
	}
}

// OCP: to allow a new decision later (like 'suspended') you just add it here. the logic below doesn't need to change.
const ALLOWED_DECISIONS: ApprovalStatus[] = ["approved", "rejected"];

// SRP: this class holds the approval rules only. no sql and no req/res in here.
export class VendorApprovalService {
	constructor(
		private reader: IVendorReader, // DIP: we get the reader passed in instead of creating it. so we can pass a fake one when testing.
		private writer: IVendorWriter, // same idea for the writer. the real MySQL repository fills both slots.
	) {}

	listByStatus(status: ApprovalStatus): Promise<Vendor[]> {
		return this.reader.findByStatus(status); // just hands the request to the reader. no extra rules needed for listing.
	}

	async decide(id: number, decision: ApprovalStatus): Promise<void> {
		if (!ALLOWED_DECISIONS.includes(decision)) {
			// blocks anything that isn't approved or rejected. admin shouldn't be able to push a vendor back to 'pending' through this.
			throw new ServiceError("Decision must be approved or rejected.", 400); // 400 = the request itself was bad.
		}

		const updated = await this.writer.updateStatus(id, decision); // asks the writer to save the new status. it tells us true or false.

		if (!updated) {
			// false means no vendor had that id.
			throw new ServiceError("Vendor not found.", 404); // 404 = nothing there with that id.
		}
	}
}
