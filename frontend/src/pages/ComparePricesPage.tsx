import { useState } from 'react'
import Navbar from '../components/Navbar'

function ComparePricesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOrder, setSortOrder] = useState('default')
  
  // Sample listings for testing the search feature.
  const listings = [
    {
      id: 1,
      product: 'Regular Rice',
      vendor: 'Sample Vendor A',
      price: 48,
      unit: 'per kilogram',
      reviewStatus: 'Reviewed',
      freshness: 'Recent',
      update: 'Updated today',
    },
    {
      id: 2,
      product: 'Regular Rice',
      vendor: 'Sample Vendor B',
      price: 52,
      unit: 'per kilogram',
      reviewStatus: 'Reviewed',
      freshness: 'Aging',
      update: 'Updated 2 days ago',
    },
    {
      id: 3,
      product: 'Regular Rice',
      vendor: 'Sample Vendor C',
      price: null,
      unit: 'per kilogram',
      reviewStatus: 'Pending Review',
      freshness: 'Not verified',
      update: 'Awaiting review',
    },
    {
      id: 4,
      product: 'White Eggs',
      vendor: 'Sample Vendor D',
      price: 9,
      unit: 'per piece',
      reviewStatus: 'Reviewed',
      freshness: 'Recent',
      update: 'Updated today',
    },
    {
      id: 5,
      product: 'Tomatoes',
      vendor: 'Sample Vendor E',
      price: 65,
      unit: 'per kilogram',
      reviewStatus: 'Reviewed',
      freshness: 'Recent',
      update: 'Updated today',
    },
  ]

  // Filter listings using the product or vendor name.
  const filteredListings = listings.filter((listing) => {
    const search = searchTerm.toLowerCase()

    return (
      listing.product.toLowerCase().includes(search) ||
      listing.vendor.toLowerCase().includes(search)
    )
  })

  // Group listings by matching product and unit.
const productGroups = [
    ...new Set(
      filteredListings.map(
        (listing) => `${listing.product}|${listing.unit}`
      )
    ),
  ].map((groupKey) => {
    const groupListings = filteredListings.filter(
      (listing) => `${listing.product}|${listing.unit}` === groupKey
    )
  
    const sortedGroupListings = [...groupListings].sort((a, b) => {
      if (a.price === null) return 1
      if (b.price === null) return -1
  
      if (sortOrder === 'lowest') return a.price - b.price
      if (sortOrder === 'highest') return b.price - a.price
  
      return a.id - b.id
    })
  
    return {
      key: groupKey,
      product: groupListings[0].product,
      unit: groupListings[0].unit,
      listings: sortedGroupListings,
    }
  })

  return (
    <main className="min-h-screen bg-[#FAF7F0] text-[#252C28]">
  <Navbar
    links={[
      { label: 'Home', path: '/' },
      { label: 'Compare Prices', path: '/compare-prices' },
      { label: 'Shopping List', path: '/shopping-list' },
    ]}
  />

      <section className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="text-3xl font-bold">
          Compare Market Prices
        </h2>

        <p className="mt-2 text-[#68746D]">
          Check and compare submitted prices from different vendors.
        </p>

        {/* Product search */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search for a product (e.g. Rice, Eggs, Tomatoes)"
            className="w-full rounded-xl border border-[#E5E1D7] bg-white px-5 py-4 text-sm outline-none transition focus:border-[#286247] sm:flex-1"
          />

          <button
            type="button"
            onClick={() => setSearchTerm(searchTerm.trim())}
            className="rounded-xl bg-[#286247] px-8 py-4 text-sm font-semibold text-white transition hover:bg-[#1C4635]"
          >
            Search Prices
          </button>
        </div>

        {/* Product listings */}
        <div className="mt-12">
          <div className="mb-6">
            <h3 className="text-xl font-bold">
              Available Price Listings
            </h3>

            <p className="mt-1 text-sm text-[#68746D]">
              Compare prices and check when vendor listings were last updated.
            </p>
          </div>

        {/* Sorting options */}
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#68746D]">
            Showing {filteredListings.length} price listings
        </p>

        <select
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
            className="rounded-lg border border-[#E5E1D7] bg-white px-4 py-3 text-sm outline-none focus:border-[#286247]"
        >
            <option value="default">Default order</option>
            <option value="lowest">Lowest price first</option>
            <option value="highest">Highest price first</option>
        </select>
        </div>

          
{productGroups.map((group) => (
  <div key={group.key} className="mb-10">
    <div className="mb-4">
      <h4 className="text-lg font-bold text-[#252C28]">
        {group.product}
      </h4>
      <p className="text-sm text-[#68746D]">
        Comparing prices {group.unit}
      </p>
    </div>

    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {group.listings.map((listing) => (
        <div
          key={listing.id}
          className="rounded-2xl border border-[#E5E1D7] bg-white p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                listing.reviewStatus === 'Reviewed'
                  ? 'bg-[#E8F1EA] text-[#286247]'
                  : 'bg-[#FFF3DD] text-[#94651C]'
              }`}
            >
              {listing.reviewStatus}
            </span>

            <span className="text-xs text-[#68746D]">
              {listing.freshness}
            </span>
          </div>

          <h4 className="text-lg font-bold">{listing.product}</h4>

          <p className="mt-1 text-sm text-[#68746D]">
            {listing.vendor}
          </p>

          {listing.price !== null ? (
            <>
              <p className="mt-5 text-3xl font-bold text-[#286247]">
                ₱{listing.price.toFixed(2)}
              </p>
              <p className="mt-1 text-sm text-[#68746D]">
                {listing.unit}
              </p>
            </>
          ) : (
            <>
              <p className="mt-5 text-sm font-semibold text-[#94651C]">
                Price not yet verified
              </p>
              <p className="mt-1 text-sm text-[#68746D]">
                Not included in verified comparisons
              </p>
            </>
          )}

          <p className="mt-4 border-t border-[#E5E1D7] pt-3 text-xs text-[#68746D]">
            Sample listing · {listing.update}
          </p>
        </div>
      ))}
    </div>
  </div>
))}
          {productGroups.length === 0 && (
            <div className="rounded-2xl border border-[#E5E1D7] bg-white px-6 py-12 text-center">
              <h4 className="text-lg font-semibold">
                No matching products found
              </h4>

              <p className="mt-2 text-sm text-[#68746D]">
                Try searching for another product or vendor.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export default ComparePricesPage
