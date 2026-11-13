
import { useState } from 'react'
import { Link } from 'react-router-dom'

function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('customer')
  const [message, setMessage] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (password !== confirmPassword) {
			setMessage("Passwords do not match.");
			return;
		}

		try {
			const response = await fetch("http://localhost:5000/api/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ fullName, email, password, role }),
			});
			const data = await response.json();
			setMessage(data.message);
		} catch {
			setMessage("Cannot reach the server. Please try again.");
		}
	}

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF7F0] px-6 py-12 text-[#252C28]">
      <div className="w-full max-w-md rounded-2xl border border-[#E5E1D7] bg-white p-8 shadow-sm">

        <Link to="/" className="text-sm font-medium text-[#286247]">
          ← Back to Home
        </Link>

        <div className="mt-8 text-center">
          <h1 className="text-3xl font-bold text-[#286247]">
            PresyongBayan
          </h1>

          <h2 className="mt-6 text-2xl font-bold">
            Create an Account
          </h2>

          <p className="mt-2 text-sm text-[#68746D]">
            Join PresyongBayan and get started.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Full Name
            </label>

            <input
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Enter your full name"
              required
              className="w-full rounded-xl border border-[#E5E1D7] px-4 py-3 text-sm outline-none focus:border-[#286247]"
            />
          </div>

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
            <label className="mb-2 block text-sm font-semibold">
              Account Type
            </label>

            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="w-full rounded-xl border border-[#E5E1D7] bg-white px-4 py-3 text-sm outline-none focus:border-[#286247]"
            >
              <option value="customer">Customer</option>
              <option value="vendor">Vendor</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Create a password"
              required
              minLength={8}
              className="w-full rounded-xl border border-[#E5E1D7] px-4 py-3 text-sm outline-none focus:border-[#286247]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Confirm Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm your password"
              required
              minLength={8}
              className="w-full rounded-xl border border-[#E5E1D7] px-4 py-3 text-sm outline-none focus:border-[#286247]"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-[#286247] px-5 py-3 font-semibold text-white transition hover:bg-[#1C4635]"
          >
            Create Account
          </button>

          {message && (
            <p role="status" className="text-center text-sm text-[#94651C]">
              {message}
            </p>
          )}

        </form>

        <p className="mt-6 text-center text-sm text-[#68746D]">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[#286247]">
            Log In
          </Link>
        </p>

      </div>
    </main>
  )
}

export default RegisterPage
