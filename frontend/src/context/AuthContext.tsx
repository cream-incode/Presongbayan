import {
	createContext,
	useContext,
	useEffect,
	useState,
	type ReactNode,
} from "react"; // context lets any component read the user without passing props down.
import { api } from "../api/client"; // our fetch wrapper.

export interface User {
	id: number;
	fullName: string;
	email: string;
	role: "admin" | "vendor" | "customer"; // same roles the backend puts in the token.
}

interface AuthValue {
	user: User | null; // null = not logged in.
	loading: boolean; // true while we're still checking the saved token on page load.
	login: (email: string, password: string) => Promise<User>;
	logout: () => void;
}

const AuthContext = createContext<AuthValue | null>(null); // starts empty, the provider below fills it.

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null); // the current user.
	const [loading, setLoading] = useState(true); // starts true so protected pages don't flash the login page on refresh.

	useEffect(() => {
		// runs once when the app loads to restore the session.
		if (!localStorage.getItem("token")) {
			setLoading(false); // no token, so nothing to check.
			return;
		}
		api<{ user: User }>("/auth/me") // asks the backend who this token belongs to.
			.then((data) => setUser(data.user)) // token is good, so we're logged in.
			.catch(() => localStorage.removeItem("token")) // expired or fake token, so we throw it away.
			.finally(() => setLoading(false)); // done checking either way.
	}, []);

	const login = async (email: string, password: string) => {
		const data = await api<{ token: string; user: User }>("/auth/login", {
			method: "POST", // POST so the password isn't in the url.
			body: JSON.stringify({ email, password }), // only email and password, the backend decides the role.
		});
		localStorage.setItem("token", data.token); // save it so refresh doesn't log us out.
		setUser(data.user); // update the app right away.
		return data.user; // returned so the login page can redirect based on role.
	};

	const logout = () => {
		localStorage.removeItem("token"); // forget the token.
		setUser(null); // back to logged out.
	};

	return (
		<AuthContext.Provider value={{ user, loading, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
}

export const useAuth = () => {
	const ctx = useContext(AuthContext); // grabs the value from the provider.
	if (!ctx) throw new Error("useAuth must be used inside AuthProvider"); // catches the mistake of forgetting to wrap the app.
	return ctx;
};
