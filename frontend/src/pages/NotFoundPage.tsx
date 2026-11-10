
import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF7F0] px-6 text-[#252C28]">
      <div className="w-full max-w-md rounded-2xl border border-[#E5E1D7] bg-white p-8 text-center shadow-sm">
        <h1 className="text-6xl font-bold text-[#286247]">
          404
        </h1>

        <h2 className="mt-4 text-2xl font-bold">
          Page Not Found
        </h2>

        <p className="mt-2 text-sm text-[#68746D]">
          Sorry, the page you're looking for doesn't exist or may have been moved.
        </p>

        <Link
          to="/"
          className="mt-6 inline-block rounded-xl bg-[#286247] px-6 py-3 font-semibold text-white transition hover:bg-[#1C4635]"
        >
          Back to Home
        </Link>
      </div>
    </main>
  )
}

export default NotFoundPage
