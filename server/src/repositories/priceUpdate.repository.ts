import { RowDataPacket, ResultSetHeader } from 'mysql2/promise' // types for select rows and for insert/update results. imported from the promise version to match your pool.
import { db } from '../config/db' // your pool from config/db.ts, a named export.
import {
  IPriceUpdateByStatusReader,
  IPriceUpdateByVendorReader,
  IPriceUpdateReviewer,
  IPriceUpdateSubmitter,
  PriceUpdate,
  ReviewStatus,
} from '../types/priceUpdate.types' // our types and the 4 interfaces this class promises to follow.

// the same SELECT is used by both list queries, so it lives in one constant. the JOINs pull in the product and vendor names so we don't need extra queries.
const SELECT_VIEW = `
  SELECT u.id, u.product_id, p.product_name, v.full_name AS vendor_name, p.unit,
         p.current_price, u.proposed_price, u.status, u.submitted_at, u.reviewed_at
  FROM product_update u
  JOIN product p ON u.product_id = p.id
  JOIN vendor v ON u.submitted_by_vendor_id = v.id`

// turns a raw db row into a PriceUpdate. one function so both list methods stay the same.
function toPriceUpdate(row: RowDataPacket): PriceUpdate {
  return {
    id: row.id, // already named id.
    productId: row.product_id, // product_id becomes productId.
    productName: row.product_name, // product_name becomes productName.
    vendorName: row.vendor_name, // the alias we made in the SELECT.
    unit: row.unit, // no change needed.
    currentPrice: Number(row.current_price), // DECIMAL comes back from mysql2 as a string, so Number() fixes it.
    proposedPrice: Number(row.proposed_price), // same DECIMAL fix.
    status: row.status, // pending, approved or rejected.
    submittedAt: row.submitted_at, // the datetime as it is.
    reviewedAt: row.reviewed_at ?? null, // the ?? turns undefined into null so the frontend always gets one or the other.
  }
}

// SRP: only sql for price submissions lives here. no rules and no http.
export class MySqlPriceUpdateRepository
  implements IPriceUpdateByVendorReader, IPriceUpdateByStatusReader, IPriceUpdateSubmitter, IPriceUpdateReviewer
{
  async findByVendor(vendorId: number): Promise<PriceUpdate[]> {
    const [rows] = await db.query<RowDataPacket[]>( // runs the select.
      `${SELECT_VIEW} WHERE u.submitted_by_vendor_id = ? ORDER BY u.submitted_at DESC`, // only this vendor's rows, newest first. the ? keeps the value safe from SQL injection.
      [vendorId] // fills the ?.
    )
    return rows.map(toPriceUpdate) // converts every row with the helper above.
  }

  async findByStatus(status: ReviewStatus): Promise<PriceUpdate[]> {
    const [rows] = await db.query<RowDataPacket[]>( // same idea but filtered by status.
      `${SELECT_VIEW} WHERE u.status = ? ORDER BY u.submitted_at ASC`, // oldest first for the admin, so the longest-waiting ones are on top.
      [status] // fills the ?.
    )
    return rows.map(toPriceUpdate) // same conversion.
  }

  async create(vendorId: number, productId: number, proposedPrice: number): Promise<number> {
    const [result] = await db.query<ResultSetHeader>( // runs the insert.
      `INSERT INTO product_update (product_id, submitted_by_vendor_id, proposed_price)
       SELECT p.id, ?, ?
       FROM product p
       JOIN stall s ON p.stall_id = s.id
       WHERE p.id = ? AND s.vendor_id = ? AND p.approval_status = 'approved'`, // INSERT ... SELECT only inserts when the product sits in one of this vendor's stalls AND the admin already approved it. otherwise zero rows go in, so nobody can submit prices for other vendors' products or for products still waiting for review.
      [vendorId, proposedPrice, productId, vendorId] // order matches the 4 ? above.
    )
    return result.affectedRows > 0 ? result.insertId : 0 // the new id, or 0 when the product wasn't theirs. the service turns the 0 into a 404.
  }

  async updatePending(id: number, vendorId: number, proposedPrice: number): Promise<boolean> {
    const [result] = await db.query<ResultSetHeader>( // runs the update.
      `UPDATE product_update SET proposed_price = ?
       WHERE id = ? AND submitted_by_vendor_id = ? AND status = 'pending'`, // 3 checks in one: right id, right owner, still pending. an already reviewed price can't be edited.
      [proposedPrice, id, vendorId] // new price first, then the WHERE values.
    )
    return result.affectedRows > 0 // true if a row changed.
  }

  async removePending(id: number, vendorId: number): Promise<boolean> {
    const [result] = await db.query<ResultSetHeader>( // runs the delete.
      `DELETE FROM product_update
       WHERE id = ? AND submitted_by_vendor_id = ? AND status = 'pending'`, // same 3 checks. only the vendor's own unreviewed submissions can be cancelled.
      [id, vendorId] // id then owner.
    )
    return result.affectedRows > 0 // true if deleted.
  }

  async review(id: number, adminId: number, decision: ReviewStatus): Promise<boolean> {
    const connection = await db.getConnection() // a transaction has to run on ONE connection, so we borrow one from the pool.
    try {
      await connection.beginTransaction() // starts the transaction. nothing is saved for real until commit.

      const [result] = await connection.query<ResultSetHeader>( // marks the submission as decided.
        `UPDATE product_update
         SET status = ?, reviewed_by_admin_id = ?, reviewed_at = NOW()
         WHERE id = ? AND status = 'pending'`, // the status = 'pending' check stops a submission from being reviewed twice, even if two admins click at the same time.
        [decision, adminId, id] // the decision, who made it, and which submission.
      )

      if (result.affectedRows === 0) { // nothing changed, so the id is wrong or it was already reviewed.
        await connection.rollback() // undoes anything in the transaction. nothing was changed here, but it closes the transaction cleanly.
        return false // the service turns this into a 404.
      }

      if (decision === 'approved') { // only an approval touches the product's price.
        await connection.query( // copies the proposed price into the live product.
          `UPDATE product p
           JOIN product_update u ON u.product_id = p.id
           SET p.current_price = u.proposed_price
           WHERE u.id = ?`, // the JOIN lets us read the proposed price and write the product's price in one statement.
          [id] // which submission we're applying.
        )
      }

      await connection.commit() // saves both changes together. either both happen or neither does.
      return true // success.
    } catch (error) {
      await connection.rollback() // if anything failed, undo the whole thing so the status and price can't get out of sync.
      throw error // pass the error up so the controller can send a 500.
    } finally {
      connection.release() // gives the connection back to the pool. without this the pool eventually runs out.
    }
  }
}
