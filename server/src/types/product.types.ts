import { ApprovalStatus } from "./vendor.types"; // reusing the pending/approved/rejected type so the product can carry its review status.

// shape of a product sent to the frontend. it matches the PRODUCT table in your ERD, just in camelCase.
export interface Product {
	id: number; // the product's primary key (the id column).
	stallId: number; // stall_id, which stall sells it. the stall tells us who the owner is.
	categoryId: number; // category_id, the FK to PRODUCT_CATEGORY.
	name: string; // product_name, like "Regular Rice".
	brand: string; // brand, can be empty if the product has none.
	packageSize: number; // package_size, how much is in one pack. it's a decimal so we turn it into a number in the repository.
	unit: string; // unit, like kg or piece. it goes together with packageSize.
	currentPrice: number; // current_price, the live price shown to customers.
	isAvailable: boolean; // is_available, true means in stock. the vendor can flip it.
	approvalStatus: ApprovalStatus; // pending, approved or rejected. new products start as pending until an admin reviews them.
	lastUpdated: string; // last_updated, when the row last changed. the db sets it with NOW().
}

// fields a vendor can change on an existing product. price is NOT here on purpose, price changes will go through PRODUCT_UPDATE so the admin can review them.
export interface ProductFields {
	categoryId: number; // the product's category.
	name: string; // the product's name.
	brand: string; // the product's brand.
	packageSize: number; // size of one pack.
	unit: string; // unit for that size.
	isAvailable: boolean; // in stock or not.
}

// when creating we also need the stall and a starting price. after that, the price only changes via the review flow.
export interface ProductCreateInput extends ProductFields {
	stallId: number; // which of the vendor's stalls sells it.
	currentPrice: number; // the first price of the listing.
}

// updating just uses the editable fields. it's a separate name so the code reads clearly.
export type ProductUpdateInput = ProductFields;

// ISP: read-only interface for listing products.
export interface IProductReader {
	findByVendor(vendorId: number): Promise<Product[]>; // gets all products across the vendor's own stalls.
}

// ISP: write-only interface. every method gets vendorId so the db query can confirm ownership.
export interface IProductWriter {
	create(vendorId: number, input: ProductCreateInput): Promise<number>; // returns the new id, or 0 if the stall isn't the vendor's.
	update(
		id: number,
		vendorId: number,
		input: ProductUpdateInput,
	): Promise<boolean>; // true if updated, false if not found or not yours.
	remove(id: number, vendorId: number): Promise<boolean>; // true if deleted, false if not found or not yours.
}
