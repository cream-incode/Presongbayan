import { RowDataPacket, ResultSetHeader } from "mysql2"; // these are mysql2's types for select rows and for insert/update results. we need them so TypeScript knows what db.query gives back.
import { db } from '../config/db' // curly braces because db is a named export in config/db.ts. the name inside has to match exactly what db.ts exports, so "db" works here.

import {
	ApprovalStatus,
	IVendorReader,
	IVendorWriter,
	Vendor,
} from "../types/vendor.types"; // pulling in our types and interfaces. the class below promises to follow both interfaces.

// SRP: this class only talks to MySQL and nothing else. no http stuff, no business rules.
export class MySqlVendorRepository implements IVendorReader, IVendorWriter {
	async findByStatus(status: ApprovalStatus): Promise<Vendor[]> {
		const [rows] = await db.query<RowDataPacket[]>( // runs the select and gives back the rows. the generic tells TypeScript each row is a plain object.
			"SELECT id, full_name, email, approval_status FROM vendor WHERE approval_status = ?", // the ? is a placeholder so the status gets escaped by mysql2. that's what protects us from SQL injection.
			[status], // this value fills in the ? above. order matters if there are more than one.
		);

		return rows.map((row) => ({
			// turns raw db rows into Vendor objects. this is where snake_case becomes camelCase.
			id: row.id, // same name in both places so just copy it over.
			fullName: row.full_name, // db column is full_name but the frontend wants fullName.
			email: row.email, // no rename needed here.
			approvalStatus: row.approval_status, // same idea, approval_status becomes approvalStatus.
		}));
	}

	async updateStatus(id: number, status: ApprovalStatus): Promise<boolean> {
		const [result] = await db.query<ResultSetHeader>( // update queries return a ResultSetHeader instead of rows. it has affectedRows which we check below.
			"UPDATE vendor SET approval_status = ? WHERE id = ?", // changes only the one vendor that matches the id. the ?s keep the values safe again.
			[status, id], // first ? is the new status, second ? is the id. the order here has to match the query.
		);

		return result.affectedRows > 0; // true means a vendor was really updated. false means that id doesn't exist.
	}
}
