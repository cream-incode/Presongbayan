import { RowDataPacket, ResultSetHeader } from "mysql2/promise"; // types for select rows and update results. from the promise version to match your pool.
import { db } from "../config/db"; // your pool from config/db.ts, a named export.
import {
	IProductReviewer,
	IProductSubmissionReader,
	ProductSubmission,
} from "../types/productReview.types"; // our types and the 2 interfaces this class follows.
import { ApprovalStatus } from "../types/vendor.types"; // the status type for the method params.

// SRP: only the sql for the admin's product review lives here. no rules and no http.
export class MySqlProductReviewRepository
	implements IProductSubmissionReader, IProductReviewer
{
	async findByStatus(status: ApprovalStatus): Promise<ProductSubmission[]> {
		const [rows] = await db.query<RowDataPacket[]>( // runs the select.
			`SELECT p.id, p.product_name, p.brand, p.package_size, p.unit, p.current_price,
              p.approval_status, p.created_at, p.reviewed_at,
              c.category_name, s.stall_name, m.market_name, v.full_name AS vendor_name
       FROM product p
       JOIN product_category c ON p.category_id = c.id
       JOIN stall s ON p.stall_id = s.id
       JOIN market m ON s.market_id = m.id
       JOIN vendor v ON s.vendor_id = v.id
       WHERE p.approval_status = ?
       ORDER BY p.created_at ASC`, // the JOINs bring in the category, stall, market and vendor names. oldest first so the longest-waiting products are on top. the ? keeps the status safe from SQL injection.
			[status], // fills the ?.
		);

		return rows.map((row) => ({
			// turns each db row into a ProductSubmission.
			id: row.id, // already named id.
			productName: row.product_name, // product_name becomes productName.
			brand: row.brand ?? "", // brand can be NULL in the db, so we use '' instead. the ?? only kicks in for null or undefined.
			packageSize: Number(row.package_size), // DECIMAL comes back from mysql2 as a string, so Number() fixes it.
			unit: row.unit, // no change needed.
			price: Number(row.current_price), // same DECIMAL fix for the price.
			categoryName: row.category_name, // from the category JOIN.
			stallName: row.stall_name, // from the stall JOIN.
			marketName: row.market_name, // from the market JOIN.
			vendorName: row.vendor_name, // the alias we made in the SELECT.
			approvalStatus: row.approval_status, // pending, approved or rejected.
			submittedAt: row.created_at, // when the product was first added.
			reviewedAt: row.reviewed_at ?? null, // null while nobody has reviewed it.
		}));
	}

	async review(
		id: number,
		adminId: number,
		decision: ApprovalStatus,
	): Promise<boolean> {
		const [result] = await db.query<ResultSetHeader>( // updates return a ResultSetHeader with affectedRows.
			`UPDATE product
       SET approval_status = ?, reviewed_by_admin_id = ?, reviewed_at = NOW()
       WHERE id = ? AND approval_status = 'pending'`, // the approval_status = 'pending' check means a product can only be decided once, even if two admins click at the same time. it's one statement so we don't need a transaction.
			[decision, adminId, id], // the decision, which admin made it, and which product.
		);
		return result.affectedRows > 0; // true if a row changed. false means a wrong id or it was already reviewed.
	}
}
