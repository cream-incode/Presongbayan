// same 3 statuses as the backend so both sides agree. if you add one on the server, add it here too.
export type ApprovalStatus = "pending" | "approved" | "rejected";

// shape of one vendor coming from GET /api/vendors. it matches what the repository sends.
export type Vendor = {
	id: number; // the vendor's db id. we send it back when approving or rejecting.
	fullName: string; // shown as the vendor's name on the card.
	email: string; // shown under the name so the admin can verify who it is.
	approvalStatus: ApprovalStatus; // current status. on this page it's always pending.
};

const API_URL = "http://localhost:5000/api/vendors"; // same host as your register call. change it here once if the port changes.

// SRP: this file only does the fetch calls. no react state and no jsx in here.
function authHeaders() {
	const token = localStorage.getItem("token"); // ASSUMPTION: your login saves the JWT under the key "token". rename it if you used a different key.
	return {
		"Content-Type": "application/json", // tells the server our body is json. needed for the PATCH.
		Authorization: `Bearer ${token}`, // your requireAuth middleware reads this header. without it the admin gets a 401.
	};
}

export async function fetchVendors(status: ApprovalStatus): Promise<Vendor[]> {
	const response = await fetch(`${API_URL}?status=${status}`, {
		headers: authHeaders(),
	}); // asks the server for vendors with that status. the token proves we're admin.
	if (!response.ok) throw new Error("Failed to load vendors"); // fetch doesn't throw on 401/500 by itself so we do it. the hook catches this.
	const data = await response.json(); // turns the response body into a js object. it looks like { vendors: [...] }.
	return data.vendors; // we only return the array. the rest of the app doesn't care about the wrapper.
}

export async function updateVendorStatus(
	id: number,
	status: ApprovalStatus,
): Promise<void> {
	const response = await fetch(`${API_URL}/${id}/status`, {
		method: "PATCH", // PATCH because we're changing just one field. PUT would suggest replacing the whole vendor.
		headers: authHeaders(), // same auth headers as above so the server accepts us.
		body: JSON.stringify({ status }), // sends { status: 'approved' } or { status: 'rejected' }. it's what the controller reads.
	});
	if (!response.ok) throw new Error("Failed to update vendor"); // same idea, turn a bad status code into an error the hook can catch.
}
