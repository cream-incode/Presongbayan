import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { products, type Product } from '../data/ingredients'

type ShoppingItem = Product & {
  quantity: number
}

function ShoppingListPage() {
  const location = useLocation()

  const incomingState = location.state as {
    ingredients?: ShoppingItem[]
    mealName?: string
  } | null

  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(
    () => incomingState?.ingredients ?? []
  )

  const [selectedProduct, setSelectedProduct] = useState('1')
  const [quantity, setQuantity] = useState('1')
  
  function handleAddItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const product = products.find(
      (item) => item.id === Number(selectedProduct)
    )

    const numericQuantity = Number(quantity)

    if (!product || !Number.isFinite(numericQuantity) || numericQuantity <= 0) {
      return
    }

    setShoppingList((currentList) => {
      const existingItem = currentList.find(
        (item) => item.id === product.id
      )

      if (existingItem) {
        return currentList.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + numericQuantity }
            : item
        )
      }

      return [
        ...currentList,
        { ...product, quantity: numericQuantity },
      ]
    })

    setQuantity('1')
  }

  function handleRemoveItem(id: number) {
    setShoppingList((currentList) =>
      currentList.filter((item) => item.id !== id)
    )
  }

  const total = shoppingList.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  return (
    <main className="min-h-screen bg-[#FAF7F0] text-[#252C28]">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="text-3xl font-bold">
          Shopping List
        </h2>

        <p className="mt-2 text-[#68746D]">
          Plan your grocery purchases and estimate your total expenses.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[380px_1fr]">

          <div className="h-fit rounded-2xl border border-[#E5E1D7] bg-white p-6">
            <h3 className="text-xl font-bold">
              Add Shopping Item
            </h3>

            <form onSubmit={handleAddItem} className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Select Product
                </label>

                <select
                  value={selectedProduct}
                  onChange={(event) =>
                    setSelectedProduct(event.target.value)
                  }
                  className="w-full rounded-xl border border-[#E5E1D7] bg-white px-4 py-3 text-sm outline-none focus:border-[#286247]"
                >
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} — ₱{product.price.toFixed(2)}/{product.unit}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Quantity
                </label>

                <input
                  type="number"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  min="0.01"
                  step="0.01"
                  required
                  className="w-full rounded-xl border border-[#E5E1D7] px-4 py-3 text-sm outline-none focus:border-[#286247]"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#286247] px-5 py-3 font-semibold text-white transition hover:bg-[#1C4635]"
              >
                Add to Shopping List
              </button>
            </form>
          </div>

          <div>
            <h3 className="text-xl font-bold">
              Your Shopping List
            </h3>

            <p className="mt-1 text-sm text-[#68746D]">
              Review your selected products and estimated costs.
            </p>

            <div className="mt-6 space-y-4">
              {shoppingList.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col justify-between gap-4 rounded-2xl border border-[#E5E1D7] bg-white p-6 sm:flex-row sm:items-center"
                >
                  <div>
                    <h4 className="font-bold">{item.name}</h4>

                    <p className="mt-1 text-sm text-[#68746D]">
                    {Number(item.quantity.toFixed(2))} {item.unit} × ₱{item.price.toFixed(2)}
                    </p>

                    <p className="mt-2 font-semibold text-[#286247]">
                      ₱{(item.quantity * item.price).toFixed(2)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="rounded-lg border border-[#C96F52] px-4 py-2 text-sm font-semibold text-[#C96F52] hover:bg-[#FFF0EA]"
                  >
                    Remove
                  </button>
                </div>
              ))}

              {shoppingList.length === 0 && (
                <div className="rounded-2xl border border-[#E5E1D7] bg-white p-10 text-center">
                  <h4 className="font-semibold">
                    Your shopping list is empty
                  </h4>

                  <p className="mt-2 text-sm text-[#68746D]">
                    Add products to calculate your estimated expenses.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 rounded-2xl bg-[#286247] p-6 text-white">
              <p className="text-sm text-white/80">
                Estimated Basket Total
              </p>

              <p className="mt-2 text-3xl font-bold">
                ₱{total.toFixed(2)}
              </p>

              <p className="mt-2 text-xs text-white/80">
                Based on the sample prices currently provided.
              </p>
            </div>
          </div>

        </div>
      </section>
    </main>
  )
}

export default ShoppingListPage
