import { RowDataPacket, ResultSetHeader } from "mysql2/promise"; // types for select rows and for insert/update results. we import from the promise version to match your pool.
import { db } from "../config/db"; // your pool from config/db.ts. it's a named export so it needs the curly braces.
import {
	IStallReader,
	IStallWriter,
	Stall,
	StallInput,
} from "../types/stall.types"; // our types and the 2 interfaces this class promises to follow.

// SRP: only sql for the STALL table lives here. no validation and no http.
export class MySqlStallRepository implements IStallReader, IStallWriter {
	async findByVendor(vendorId: number): Promise<Stall[]> {
		const [rows] = await db.query<RowDataPacket[]>( // runs the select and returns the rows. the generic types each row as a plain object.
			"SELECT id, market_id, vendor_id, stall_name FROM stall WHERE vendor_id = ?", // WHERE vendor_id keeps each vendor inside their own stalls. the ? is a placeholder so mysql2 escapes the value.
			[vendorId], // fills the ?. order matters when there are several.
		);

		return rows.map((row) => ({
			// converts db rows into Stall objects. this is where snake_case turns into camelCase.
			id: row.id, // the column is already called id so it copies straight over.
			marketId: row.market_id, // market_id becomes marketId.
			vendorId: row.vendor_id, // vendor_id becomes vendorId.
			stallName: row.stall_name, // stall_name becomes stallName.
		}));
	}

	async create(vendorId: number, input: StallInput): Promise<number> {
		const [result] = await db.query<ResultSetHeader>( // inserts return a ResultSetHeader. it carries insertId and affectedRows.
			"INSERT INTO stall (market_id, vendor_id, stall_name) VALUES (?, ?, ?)", // adds the new stall row. vendor_id comes from the token, never from the request body.
			[input.marketId, vendorId, input.stallName], // order matches the three ? above.
		);
		return result.insertId; // the auto-generated id of the new row.
	}

	async update(
		id: number,
		vendorId: number,
		input: StallInput,
	): Promise<boolean> {
		const [result] = await db.query<ResultSetHeader>( // updates return a ResultSetHeader too.
			"UPDATE stall SET market_id = ?, stall_name = ? WHERE id = ? AND vendor_id = ?", // the AND vendor_id part is the ownership check. if the stall is someone else's, zero rows change.
			[input.marketId, input.stallName, id, vendorId], // new values first, then the WHERE values.
		);
		return result.affectedRows > 0; // true when something changed, false when the id isn't found or isn't theirs.
	}

	async remove(id: number, vendorId: number): Promise<boolean> {
		const [result] = await db.query<ResultSetHeader>( // deletes also give back a ResultSetHeader.
			"DELETE FROM stall WHERE id = ? AND vendor_id = ?", // same ownership trick as the update. a vendor can't delete other people's stalls.
			[id, vendorId], // the stall id first and then the owner's id.
		);
		return result.affectedRows > 0; // true if deleted, false otherwise.
	}
}
