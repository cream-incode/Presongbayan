
import { useState } from 'react'

type PriceListing = {
  id: number
  product: string
  price: number
  unit: string
  status: string
}

function VendorPricesPage() {
  const [listings, setListings] = useState<PriceListing[]>([
    {
      id: 1,
      product: 'Regular Rice',
      price: 48,
      unit: 'per kilogram',
      status: 'Pending Review',
    },
    {
      id: 2,
      product: 'White Eggs',
      price: 9,
      unit: 'per piece',
      status: 'Pending Review',
    },
  ])

  const [product, setProduct] = useState('')
  const [price, setPrice] = useState('')
  const [unit, setUnit] = useState('per kilogram')
  const [editingId, setEditingId] = useState<number | null>(null)

  function resetForm() {
    setProduct('')
    setPrice('')
    setUnit('per kilogram')
    setEditingId(null)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const numericPrice = Number(price)

    if (!product.trim() || !price || numericPrice <= 0) {
      return
    }

    if (editingId !== null) {
      setListings((currentListings) =>
        currentListings.map((listing) =>
          listing.id === editingId
            ? {
                ...listing,
                product: product.trim(),
                price: numericPrice,
                unit,
                status: 'Pending Review',
              }
            : listing
        )
      )
    } else {
      const newListing: PriceListing = {
        id: Date.now(),
        product: product.trim(),
        price: numericPrice,
        unit,
        status: 'Pending Review',
      }

      setListings((currentListings) => [
        ...currentListings,
        newListing,
      ])
    }

    resetForm()
  }

  function handleEdit(listing: PriceListing) {
    setProduct(listing.product)
    setPrice(String(listing.price))
    setUnit(listing.unit)
    setEditingId(listing.id)
  }

  function handleDelete(id: number) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this price listing?'
    )

    if (confirmed) {
      setListings((currentListings) =>
        currentListings.filter((listing) => listing.id !== id)
      )

      if (editingId === id) {
        resetForm()
      }
    }
  }

  return (
    <main className="min-h-screen bg-[#FAF7F0] text-[#252C28]">
      <header className="border-b border-[#E5E1D7] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <h1 className="text-2xl font-bold text-[#286247]">
            PresyongBayan
          </h1>

          <nav className="flex gap-5 text-sm font-medium">
            <a href="/" className="hover:text-[#286247]">
              Home
            </a>
            <a href="/compare-prices" className="hover:text-[#286247]">
              Compare Prices
            </a>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="text-3xl font-bold">
          Vendor Price Management
        </h2>

        <p className="mt-2 text-[#68746D]">
          Submit and manage your product prices.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[380px_1fr]">

          <div className="h-fit rounded-2xl border border-[#E5E1D7] bg-white p-6">
            <h3 className="text-xl font-bold">
              {editingId !== null ? 'Edit Price Listing' : 'Add New Price'}
            </h3>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Product Name
                </label>

                <input
                  type="text"
                  value={product}
                  onChange={(event) => setProduct(event.target.value)}
                  placeholder="e.g. Regular Rice"
                  required
                  className="w-full rounded-xl border border-[#E5E1D7] px-4 py-3 text-sm outline-none focus:border-[#286247]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Price (₱)
                </label>

                <input
                  type="number"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  placeholder="Enter price"
                  min="0.01"
                  step="0.01"
                  required
                  className="w-full rounded-xl border border-[#E5E1D7] px-4 py-3 text-sm outline-none focus:border-[#286247]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Unit
                </label>

                <select
                  value={unit}
                  onChange={(event) => setUnit(event.target.value)}
                  className="w-full rounded-xl border border-[#E5E1D7] bg-white px-4 py-3 text-sm outline-none focus:border-[#286247]"
                >
                  <option value="per kilogram">Per kilogram</option>
                  <option value="per gram">Per gram</option>
                  <option value="per piece">Per piece</option>
                  <option value="per liter">Per liter</option>
                  <option value="per pack">Per pack</option>
                  <option value="per bundle">Per bundle</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#286247] px-5 py-3 font-semibold text-white transition hover:bg-[#1C4635]"
              >
                {editingId !== null ? 'Save Changes' : 'Submit Price'}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full rounded-xl border border-[#E5E1D7] px-5 py-3 font-semibold hover:bg-[#FAF7F0]"
                >
                  Cancel Editing
                </button>
              )}
            </form>
          </div>

          <div>
            <div className="mb-5">
              <h3 className="text-xl font-bold">
                Your Price Listings
              </h3>

              <p className="mt-1 text-sm text-[#68746D]">
                Manage your submitted product prices.
              </p>
            </div>

            <div className="space-y-4">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="rounded-2xl border border-[#E5E1D7] bg-white p-6"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <span className="rounded-full bg-[#FFF3DD] px-3 py-1 text-xs font-semibold text-[#94651C]">
                        {listing.status}
                      </span>

                      <h4 className="mt-3 text-lg font-bold">
                        {listing.product}
                      </h4>

                      <p className="mt-1 text-sm text-[#68746D]">
                        ₱{listing.price.toFixed(2)} {listing.unit}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(listing)}
                        className="rounded-lg border border-[#286247] px-4 py-2 text-sm font-semibold text-[#286247] hover:bg-[#E8F1EA]"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(listing.id)}
                        className="rounded-lg border border-[#C96F52] px-4 py-2 text-sm font-semibold text-[#C96F52] hover:bg-[#FFF0EA]"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {listings.length === 0 && (
                <div className="rounded-2xl border border-[#E5E1D7] bg-white p-10 text-center">
                  <h4 className="font-semibold">
                    No price listings yet
                  </h4>

                  <p className="mt-2 text-sm text-[#68746D]">
                    Add your first product price using the form.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </section>
    </main>
  )
}

export default VendorPricesPage
