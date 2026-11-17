// what a stall looks like when we send it to the frontend. the field names are camelCase versions of the STALL table columns in your ERD.
export interface Stall {
	id: number; // the stall's primary key (the id column). we use it to tell which stall to edit or delete.
	marketId: number; // market_id, the FK to MARKET. it says which market this stall sits in.
	vendorId: number; // vendor_id, the FK to VENDOR. it's how we know who owns the stall.
	stallName: string; // stall_name, the label the vendor gave it. shows up in the stall list.
}

// what the vendor is allowed to send when creating or editing a stall. no id and no vendorId here because the server decides those, not the client.
export interface StallInput {
	marketId: number; // which market the stall is in.
	stallName: string; // the stall's name.
}

// ISP: read-only interface. the service's list function only needs this half.
export interface IStallReader {
	findByVendor(vendorId: number): Promise<Stall[]>; // gives back only the stalls owned by that vendor. so a vendor never sees someone else's stalls.
}

// ISP: write-only interface. every method asks for vendorId too, so ownership gets checked in the db query itself.
export interface IStallWriter {
	create(vendorId: number, input: StallInput): Promise<number>; // inserts a stall and returns the new id. the vendorId comes from the JWT.
	update(id: number, vendorId: number, input: StallInput): Promise<boolean>; // true if a stall changed. false means it doesn't exist or isn't yours.
	remove(id: number, vendorId: number): Promise<boolean>; // same true/false idea for deleting.
}
