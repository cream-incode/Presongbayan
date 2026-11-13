// grabs the token we saved at login so we can attach it to every request.
const getToken = () => localStorage.getItem("token"); // returns null if nobody's logged in. localStorage keeps it even after a refresh.

export async function api<T>(
	path: string,
	options: RequestInit = {},
): Promise<T> {
	// generic <T> so each call can say what shape of data it expects back. saves us from "any" everywhere.
	const token = getToken(); // check for a saved token first.

	const res = await fetch(`/api${path}`, {
		...options, // keeps method and body from whoever called us.
		headers: {
			"Content-Type": "application/json", // tells express the body is json.
			...(token ? { Authorization: `Bearer ${token}` } : {}), // only adds the header when logged in. matches what requireAuth looks for.
		},
	});

	const data = await res.json().catch(() => ({})); // some responses have no body, so this stops it from crashing.
	if (!res.ok) throw new Error(data.message || "Something went wrong."); // uses the backend's message so the form can show "Invalid email or password."
	return data as T; // hands back the parsed json.
}
