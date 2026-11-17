// the 3 statuses a vendor can have in the db. keeping them in one union type means typos get caught by TypeScript, not by users.
export type ApprovalStatus = "pending" | "approved" | "rejected";

// shape of a vendor we send to the frontend. notice there's no password_hash here, we never want that leaving the server.
export interface Vendor {
	id: number; // primary key of the vendor row. we use it to know which vendor the admin clicked.
	fullName: string; // camelCase version of full_name so the frontend stays consistent. the repository does the renaming.
	email: string; // vendor's login email. admin sees it so they can tell vendors apart.
	approvalStatus: ApprovalStatus; // pending / approved / rejected. this is the thing the admin is changing.
}

// ISP: this one is only for reading. a class that just lists vendors shouldn't be forced to know how to update them.
export interface IVendorReader {
	findByStatus(status: ApprovalStatus): Promise<Vendor[]>; // gives back every vendor with that status. we use it to get the pending list.
}

// ISP: this one is only for writing. keeping it separate from the reader means each piece stays small and easy to swap.
export interface IVendorWriter {
	updateStatus(id: number, status: ApprovalStatus): Promise<boolean>; // returns true if a row was changed, false if the id doesn't exist. the service uses that to know if it should throw "not found".
}
