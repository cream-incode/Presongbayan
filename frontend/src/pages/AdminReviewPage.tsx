import { Link } from 'react-router-dom'
import { useState } from 'react'

type PriceSubmission = {
  id: number
  product: string
  vendor: string
  price: number
  unit: string
  status: 'Pending Review' | 'Approved' | 'Rejected'
}

function AdminReviewPage() {
  const [submissions, setSubmissions] = useState<PriceSubmission[]>([
    {
      id: 1,
      product: 'Regular Rice',
      vendor: 'Sample Vendor A',
      price: 48,
      unit: 'per kilogram',
      status: 'Pending Review',
    },
    {
      id: 2,
      product: 'White Eggs',
      vendor: 'Sample Vendor B',
      price: 9,
      unit: 'per piece',
      status: 'Pending Review',
    },
    {
      id: 3,
      product: 'Tomatoes',
      vendor: 'Sample Vendor C',
      price: 65,
      unit: 'per kilogram',
      status: 'Approved',
    },
  ])

  function updateStatus(
    id: number,
    newStatus: 'Approved' | 'Rejected'
  ) {
    setSubmissions((currentSubmissions) =>
      currentSubmissions.map((submission) =>
        submission.id === id
          ? { ...submission, status: newStatus }
          : submission
      )
    )
  }

  const pendingCount = submissions.filter(
    (submission) => submission.status === 'Pending Review'
  ).length

  return (
    <main className="min-h-screen bg-[#FAF7F0] text-[#252C28]">
      <header className="border-b border-[#E5E1D7] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <h1 className="text-2xl font-bold text-[#286247]">
            PresyongBayan
          </h1>

          <nav className="flex gap-5 text-sm font-medium">
            <Link to="/" className="hover:text-[#286247]">
                Home
            </Link>
            <Link to="/compare-prices" className="hover:text-[#286247]">
                Compare Prices
            </Link>
            </nav>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="text-3xl font-bold">
          Admin Price Review
        </h2>

        <p className="mt-2 text-[#68746D]">
          Review vendor-submitted prices before they appear as verified listings.
        </p>

        <div className="mt-8 rounded-2xl border border-[#E5E1D7] bg-white p-6">
          <p className="text-sm text-[#68746D]">
            Pending submissions
          </p>

          <p className="mt-2 text-3xl font-bold text-[#94651C]">
            {pendingCount}
          </p>
        </div>

        <div className="mt-10">
          <h3 className="text-xl font-bold">
            Vendor Submissions
          </h3>

          <p className="mt-1 text-sm text-[#68746D]">
            Check each submitted product and its price.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          {submissions.map((submission) => (
            <div
              key={submission.id}
              className="rounded-2xl border border-[#E5E1D7] bg-white p-6"
            >
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                <div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      submission.status === 'Approved'
                        ? 'bg-[#E8F1EA] text-[#286247]'
                        : submission.status === 'Rejected'
                          ? 'bg-[#FFF0EA] text-[#C96F52]'
                          : 'bg-[#FFF3DD] text-[#94651C]'
                    }`}
                  >
                    {submission.status}
                  </span>

                  <h4 className="mt-3 text-lg font-bold">
                    {submission.product}
                  </h4>

                  <p className="mt-1 text-sm text-[#68746D]">
                    Submitted by {submission.vendor}
                  </p>

                  <p className="mt-2 font-semibold text-[#286247]">
                    ₱{submission.price.toFixed(2)} {submission.unit}
                  </p>
                </div>

                {submission.status === 'Pending Review' && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateStatus(submission.id, 'Approved')
                      }
                      className="rounded-lg bg-[#286247] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1C4635]"
                    >
                      Approve
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        updateStatus(submission.id, 'Rejected')
                      }
                      className="rounded-lg border border-[#C96F52] px-4 py-2 text-sm font-semibold text-[#C96F52] hover:bg-[#FFF0EA]"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {submissions.length === 0 && (
            <div className="rounded-2xl border border-[#E5E1D7] bg-white p-10 text-center">
              <h4 className="font-semibold">
                No submissions available
              </h4>
              <p className="mt-2 text-sm text-[#68746D]">
                Vendor submissions will appear here.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export default AdminReviewPage
