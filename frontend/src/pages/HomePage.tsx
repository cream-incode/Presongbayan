function HomePage() {
    return (
      <div className="min-h-screen bg-[#FAF7F0] text-[#252C28]">
        {/* Navigation */}
        <header className="border-b border-[#E5E1D7] bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
            <a href="#" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#286247] text-xl font-bold text-white">
                P
              </div>
              <span className="text-xl font-bold tracking-tight">
                Presyong<span className="text-[#286247]">Bayan</span>
              </span>
            </a>
  
            <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
              <a href="#" className="text-[#286247]">Home</a>
              <a href="#" className="text-[#68746D] hover:text-[#286247]">
                Compare Prices
              </a>
              <a href="#" className="text-[#68746D] hover:text-[#286247]">
                Shopping List
              </a>
              <a href="#" className="text-[#68746D] hover:text-[#286247]">
                Meal Planner
              </a>
            </nav>
  
            <button className="rounded-lg bg-[#286247] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1C4635]">
              Sign In
            </button>
          </div>
        </header>
  
        <main className="mx-auto max-w-7xl px-6 py-12">
          {/* Hero */}
          <section className="grid items-center gap-10 py-10 md:grid-cols-2">
            <div>
              <span className="inline-block rounded-full bg-[#E8B949]/20 px-4 py-2 text-sm font-semibold text-[#795B16]">
                Smarter shopping starts here
              </span>
  
              <h1 className="mt-6 max-w-xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">
                Make every peso count with
                <span className="text-[#286247]"> PresyongBayan.</span>
              </h1>
  
              <p className="mt-6 max-w-lg text-base leading-7 text-[#68746D]">
                Compare market prices, plan your shopping budget, and discover
                affordable meal ideas for your household.
              </p>
  
              <div className="mt-8 flex flex-wrap gap-3">
                <button className="rounded-lg bg-[#286247] px-6 py-3 font-semibold text-white hover:bg-[#1C4635]">
                  Compare Prices
                </button>
                <button className="rounded-lg border border-[#286247] px-6 py-3 font-semibold text-[#286247] hover:bg-[#286247]/5">
                  Explore Meal Planner
                </button>
              </div>
            </div>
  
            <div className="rounded-3xl bg-[#E9EDE5] p-8 md:p-12">
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-[#68746D]">
                  Your budget, your choices
                </p>
                <div className="mt-3 text-4xl font-bold text-[#286247]">
                  ₱1,000
                </div>
                <p className="mt-1 text-sm text-[#68746D]">
                  Sample shopping budget
                </p>
  
                <div className="mt-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Shopping essentials</span>
                    <span className="font-semibold">₱650</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-[#E5E1D7]">
                    <div className="h-full w-[65%] rounded-full bg-[#286247]" />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#68746D]">Remaining budget</span>
                    <span className="font-semibold text-[#286247]">₱350</span>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-center text-xs text-[#68746D]">
                Illustrative sample only — not live market data.
              </p>
            </div>
          </section>
  
          {/* Main Features */}
          <section className="py-12">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-wider text-[#C96F52]">
                What you can do
              </p>
              <h2 className="mt-2 text-3xl font-bold">
                Everything you need for smarter shopping
              </h2>
              <p className="mt-3 text-[#68746D]">
                Make informed purchasing decisions with tools designed for your budget.
              </p>
            </div>
  
            <div className="grid gap-5 md:grid-cols-3">
              <article className="rounded-2xl border border-[#E5E1D7] bg-white p-6 transition hover:-translate-y-1 hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#286247]/10 text-2xl">
                  🔎
                </div>
                <h3 className="mt-5 text-lg font-bold">Compare Prices</h3>
                <p className="mt-2 text-sm leading-6 text-[#68746D]">
                  Check product prices from different vendors and markets before
                  deciding where to buy.
                </p>
                <a href="#" className="mt-5 inline-block text-sm font-semibold text-[#286247]">
                  Explore prices →
                </a>
              </article>
  
              <article className="rounded-2xl border border-[#E5E1D7] bg-white p-6 transition hover:-translate-y-1 hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8B949]/20 text-2xl">
                  🛒
                </div>
                <h3 className="mt-5 text-lg font-bold">Shopping Calculator</h3>
                <p className="mt-2 text-sm leading-6 text-[#68746D]">
                  Estimate your total expenses and keep track of your shopping
                  budget.
                </p>
                <a href="#" className="mt-5 inline-block text-sm font-semibold text-[#286247]">
                  Plan your budget →
                </a>
              </article>
  
              <article className="rounded-2xl border border-[#E5E1D7] bg-white p-6 transition hover:-translate-y-1 hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#C96F52]/10 text-2xl">
                  🍲
                </div>
                <h3 className="mt-5 text-lg font-bold">AI Meal Planner</h3>
                <p className="mt-2 text-sm leading-6 text-[#68746D]">
                  Discover meal suggestions based on your available budget and
                  household needs.
                </p>
                <a href="#" className="mt-5 inline-block text-sm font-semibold text-[#286247]">
                  Discover meals →
                </a>
              </article>
            </div>
          </section>
  
          {/* Price Reliability */}
          <section className="mb-12 rounded-3xl bg-[#1C4635] px-8 py-10 text-white md:px-12">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#E8B949]">
              Our commitment
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-bold">
              Know not just the price, but how reliable that price is.
            </h2>
            <p className="mt-4 max-w-2xl leading-7 text-white/75">
              Price information should be understandable and transparent.
              PresyongBayan aims to show where prices come from, when they were
              updated, and whether they have been reviewed.
            </p>
          </section>
        </main>
  
        {/* Footer */}
        <footer className="border-t border-[#E5E1D7] bg-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-7 text-sm text-[#68746D] md:flex-row md:items-center md:justify-between">
            <p>
              © 2026 PresyongBayan. Making every peso count.
            </p>
            <p>Smarter choices. Better budgeting.</p>
          </div>
        </footer>
      </div>
    )
  }
  
  export default HomePage