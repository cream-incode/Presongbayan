const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // comes from client/.env. vite only exposes vars that start with VITE_.

export async function apiRequest<T>(
	endpoint: string,
	options: RequestInit = {},
): Promise<T> {
	if (!API_BASE_URL) {
		throw new Error("API base URL is not configured."); // fails loudly if someone forgot the .env file.
	}

	const headers = new Headers(options.headers); // copies whatever headers the caller passed in.

	if (options.body && !headers.has("Content-Type")) {
		headers.set("Content-Type", "application/json"); // only needed when we're actually sending a body.
	}

	const token = localStorage.getItem("token"); // the token we saved at login. null if nobody's logged in.
	if (token && !headers.has("Authorization")) {
		headers.set("Authorization", `Bearer ${token}`); // same format requireAuth reads on the backend.
	}

	const response = await fetch(`${API_BASE_URL}${endpoint}`, {
		...options,
		headers,
	});

	if (!response.ok) {
		const raw = await response.text(); // read as text first because the body might not be json.
		let message = raw;
		try {
			message = JSON.parse(raw).message || raw; // our backend sends { message: "..." }, so we pull out just the message.
		} catch {
			// not json, so we just keep the raw text.
		}
		throw new Error(message || `API request failed: ${response.status}`); // fallback if the body was empty.
	}

	if (response.status === 204) {
		return undefined as T; // delete endpoints return nothing, so we skip .json().
	}

	return response.json() as Promise<T>;
}
