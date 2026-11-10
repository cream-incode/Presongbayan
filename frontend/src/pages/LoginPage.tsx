
import { useState } from 'react'
import { Link } from 'react-router-dom'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setMessage(
      'Login interface is ready. Backend authentication is not connected yet.'
    )
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
            Welcome Back!
          </h2>

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
            <label className="mb-2 block text-sm font-semibold">
              Password
            </label>

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
            className="w-full rounded-xl bg-[#286247] px-5 py-3 font-semibold text-white transition hover:bg-[#1C4635]"
          >
            Log In
          </button>

          {message && (
            <p role="status" className="text-center text-sm text-[#94651C]">
              {message}
            </p>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-[#68746D]">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-[#286247]">
            Create an account
          </Link>
        </p>

      </div>
    </main>
  )
}

export default LoginPage
