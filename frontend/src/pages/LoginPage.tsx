import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // adjust the path to where your friend's AuthContext file is

function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [message, setMessage] = useState("");
	const [submitting, setSubmitting] = useState(false); // stops double clicks while waiting

	const navigate = useNavigate();
	const { login } = useAuth();

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setMessage("");
		setSubmitting(true);

		try {
			const user = await login(email, password); // POST /auth/login, saves the token

			// send each role to a page that exists in App.tsx
			if (user.role === "admin") navigate("/admin/review");
			else if (user.role === "vendor") navigate("/vendor/prices");
			else navigate("/compare-prices");
		} catch (error) {
			// shows the server's message, e.g. "Invalid email or password."
			setMessage(
				error instanceof Error ? error.message : "Cannot reach the server.",
			);
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<main className="flex min-h-screen items-center justify-center bg-[#FAF7F0] px-6 py-12 text-[#252C28]">
			<div className="w-full max-w-md rounded-2xl border border-[#E5E1D7] bg-white p-8 shadow-sm">
				<Link to="/" className="text-sm font-medium text-[#286247]">
					← Back to Home
				</Link>

				<div className="mt-8 text-center">
					<h1 className="text-3xl font-bold text-[#286247]">PresyongBayan</h1>

					<h2 className="mt-6 text-2xl font-bold">Welcome Back!</h2>

					<p className="mt-2 text-sm text-[#68746D]">
						Log in to your account to continue.
					</p>
				</div>

				<form onSubmit={handleSubmit} className="mt-8 space-y-5">
					<div>
						<label className="mb-2 block text-sm font-semibold">
							Email Address
						</label>

						<input
							type="email"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							placeholder="Enter your email"
							required
							className="w-full rounded-xl border border-[#E5E1D7] px-4 py-3 text-sm outline-none focus:border-[#286247]"
						/>
					</div>

					<div>
						<label className="mb-2 block text-sm font-semibold">Password</label>

						<input
							type="password"
							value={password}
							onChange={(event) => setPassword(event.target.value)}
							placeholder="Enter your password"
							required
							minLength={8}
							className="w-full rounded-xl border border-[#E5E1D7] px-4 py-3 text-sm outline-none focus:border-[#286247]"
						/>
					</div>

					<button
						type="submit"
						disabled={submitting}
						className="w-full rounded-xl bg-[#286247] px-5 py-3 font-semibold text-white transition hover:bg-[#1C4635] disabled:opacity-60"
					>
						{submitting ? "Logging in..." : "Log In"}
					</button>

					{message && (
						<p role="status" className="text-center text-sm text-[#94651C]">
							{message}
						</p>
					)}
				</form>

				<p className="mt-6 text-center text-sm text-[#68746D]">
					Don't have an account?{" "}
					<Link to="/register" className="font-semibold text-[#286247]">
						Create an account
					</Link>
				</p>
			</div>
		</main>
	);
}

export default LoginPage;
