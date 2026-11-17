import { useEffect, useState } from "react"; // useState keeps data in the component and useEffect runs code when it first shows up. we need both to load the vendors.
import type { ApprovalStatus, Vendor } from "../services/vendorApi"; // same idea, these two are only types so they get the "type" import. They disappear at build time and don't end up in your bundle.
import { fetchVendors, updateVendorStatus } from "../services/vendorApi"; // these two are real functions that run, so they stay as a normal import. Keeping them on a separate line makes it clear which ones are types and which are code.
// SRP: this hook only manages the vendor approval state. the ui file doesn't have to know how loading or updating works.
export function useVendorApprovals() {
	const [vendors, setVendors] = useState<Vendor[]>([]); // list of pending vendors. starts empty until the fetch finishes.
	const [message, setMessage] = useState(""); // text for errors like "cannot load". empty string means nothing to show.

	async function loadPending() {
		try {
			setVendors(await fetchVendors("pending")); // gets pending vendors and stores them. react re-renders after this.
		} catch {
			setMessage("Cannot load pending vendors."); // shows when the server is down or the token is bad.
		}
	}

	useEffect(() => {
		loadPending(); // runs once when the page opens. the empty [] below makes it run only that one time.
	}, []);

	async function decide(id: number, status: ApprovalStatus) {
		try {
			await updateVendorStatus(id, status); // tells the server first. we only update the screen if it worked.
			setVendors((current) => current.filter((vendor) => vendor.id !== id)); // removes that vendor from the pending list. they're not pending anymore.
			setMessage(""); // clears old errors since this one worked.
		} catch {
			setMessage("Could not update the vendor. Please try again."); // shows when the update failed so the admin knows nothing changed.
		}
	}

	return { vendors, message, decide }; // gives the page what it needs. the page doesn't see setVendors or the fetch stuff.
}
