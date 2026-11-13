const API_URL = import.meta.env.VITE_API_URL;

export async function apiFetch(path: string, options: RequestInit = {}) {
	const token = localStorage.getItem("token");

	const response = await fetch(`${API_URL}${path}`, {
		...options,
		headers: {
			"Content-Type": "application/json",
			...(token && { Authorization: `Bearer ${token}` }), // sent automatically when logged in
			...options.headers,
		},
	});

	const data = await response.json();
	return { ok: response.ok, data };
}
