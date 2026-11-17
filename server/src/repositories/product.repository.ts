import { RowDataPacket, ResultSetHeader } from "mysql2/promise"; // same types as the stall repository. they tell TypeScript what db.query returns.
import { db } from "../config/db"; // the shared pool from config/db.ts.
import {
	IProductReader,
	IProductWriter,
	Product,
	ProductCreateInput,
	ProductUpdateInput,
} from "../types/product.types"; // our product types and the 2 interfaces this class follows.

// SRP: only sql for the PRODUCT table is in this class. a product's owner is found through its stall, so the queries join to STALL.
export class MySqlProductRepository implements IProductReader, IProductWriter {
	async findByVendor(vendorId: number): Promise<Product[]> {
		const [rows] = await db.query<RowDataPacket[]>( // runs the select.
			`SELECT p.id, p.stall_id, p.category_id, p.product_name, p.brand,
              p.package_size, p.unit, p.current_price, p.is_available, p.last_updated
       FROM product p
       JOIN stall s ON p.stall_id = s.id
       WHERE s.vendor_id = ?`, // the JOIN connects each product to its stall, and WHERE s.vendor_id keeps only this vendor's products. that's how ownership works with no vendor_id on PRODUCT.
			[vendorId], // fills the ?.
		);

		return rows.map((row) => ({
			// maps the db rows into Product objects.
			id: row.id, // the column is already named id so it copies straight over.
			stallId: row.stall_id, // stall_id becomes stallId.
			categoryId: row.category_id, // category_id becomes categoryId.
			name: row.product_name, // product_name becomes name.
			brand: row.brand ?? "", // brand can be NULL in the db so we use '' as a fallback. the ?? only kicks in for null or undefined.
			packageSize: Number(row.package_size), // mysql2 returns DECIMAL as a string. Number() makes it a real number for the frontend.
			unit: row.unit, // unit needs no conversion.
			currentPrice: Number(row.current_price), // same DECIMAL-to-number conversion for the price.
			isAvailable: Boolean(row.is_available), // MySQL stores booleans as 0 or 1. Boolean() turns that into true or false.
			lastUpdated: row.last_updated, // the datetime stays as it is.
		}));
	}

	async create(vendorId: number, input: ProductCreateInput): Promise<number> {
		const [result] = await db.query<ResultSetHeader>( // runs the insert.
			`INSERT INTO product
         (stall_id, category_id, product_name, brand, package_size, unit, current_price, is_available, last_updated)
       SELECT id, ?, ?, ?, ?, ?, ?, ?, NOW()
       FROM stall
       WHERE id = ? AND vendor_id = ?`, // INSERT ... SELECT only inserts if the stall exists AND is this vendor's. if it isn't, zero rows get inserted so nobody can add products to other stalls.
			[
				input.categoryId, // fills the 1st ? (category_id).
				input.name, // fills product_name.
				input.brand, // fills brand.
				input.packageSize, // fills package_size.
				input.unit, // fills unit.
				input.currentPrice, // fills current_price, the starting price.
				input.isAvailable ? 1 : 0, // MySQL wants 1 or 0 for booleans.
				input.stallId, // the stall_id in the WHERE.
				vendorId, // the owner check in the WHERE.
			],
		);
		return result.affectedRows > 0 ? result.insertId : 0; // the new product id if inserted, or 0 when the stall wasn't theirs. the service reads the 0 as "not allowed".
	}

	async update(
		id: number,
		vendorId: number,
		input: ProductUpdateInput,
	): Promise<boolean> {
		const [result] = await db.query<ResultSetHeader>( // runs the update.
			`UPDATE product p
       JOIN stall s ON p.stall_id = s.id
       SET p.category_id = ?, p.product_name = ?, p.brand = ?, p.package_size = ?,
           p.unit = ?, p.is_available = ?, p.last_updated = NOW()
       WHERE p.id = ? AND s.vendor_id = ?`, // the JOIN lets us check the owner in the same query. current_price isn't in the SET list, so this can't change prices.
			[
				input.categoryId, // new category.
				input.name, // new name.
				input.brand, // new brand.
				input.packageSize, // new package size.
				input.unit, // new unit.
				input.isAvailable ? 1 : 0, // new availability as 1 or 0.
				id, // which product.
				vendorId, // whose product it must be.
			],
		);
		return result.affectedRows > 0; // true if a row changed, false if not found or not theirs.
	}

	async remove(id: number, vendorId: number): Promise<boolean> {
		const [result] = await db.query<ResultSetHeader>( // runs the delete.
			`DELETE p FROM product p
       JOIN stall s ON p.stall_id = s.id
       WHERE p.id = ? AND s.vendor_id = ?`, // "DELETE p" means delete from the product alias only, and the JOIN does the ownership check again.
			[id, vendorId], // product id then owner id.
		);
		return result.affectedRows > 0; // true if deleted.
	}
}
