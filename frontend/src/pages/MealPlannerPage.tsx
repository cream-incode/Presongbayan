import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { mealIngredients, products } from '../data/ingredients'

const meals = [
  {
    
    name: 'Chicken Adobo',
    category: 'Chicken',
    cost: 65,
    description: 'Chicken cooked with soy sauce, vinegar, and garlic.',
  },
  {
    name: 'Ginisang Monggo',
    category: 'Vegetable',
    cost: 35,
    description: 'A nutritious mung bean dish with vegetables.',
  },
  {
    name: 'Sinigang na Isda',
    category: 'Fish',
    cost: 55,
    description: 'A sour fish soup with fresh vegetables.',
  },
  {
    name: 'Chopsuey',
    category: 'Vegetable',
    cost: 45,
    description: 'Mixed vegetables cooked in a savory sauce.',
  },
]

function MealPlannerPage() {

  const navigate = useNavigate()

  function handleAddIngredients(mealName: string) {
    const ingredients = (mealIngredients[mealName] ?? []).flatMap(
      (ingredient) => {
        const product = products.find(
          (item) => item.id === ingredient.productId
        )

        return product
          ? [
              {
                ...product,
                quantity: ingredient.quantity * Number(householdSize),
              },
            ]
          : []
      }
    )

    if (ingredients.length === 0) {
      return
    }

    navigate('/shopping-list', {
      state: {
        ingredients,
        mealName,
      },
    })
  }

  const [budget, setBudget] = useState('200')
  const [householdSize, setHouseholdSize] = useState('2')
  const [preference, setPreference] = useState('All')

  const totalBudget = Number(budget)
  const people = Number(householdSize)

  const isBudgetValid =
    budget.trim() !== '' &&
    Number.isFinite(totalBudget) &&
    totalBudget >= 1

const isHouseholdSizeValid =
    Number.isInteger(people) && people >= 1

  const suggestedMeals = meals.filter((meal) => {
    const matchesPreference =
      preference === 'All' || meal.category === preference

    const estimatedCost = meal.cost * people

    return (
      isBudgetValid &&
      isHouseholdSizeValid &&
      matchesPreference &&
      estimatedCost <= totalBudget
    )
  })

  return (
    <main className="min-h-screen bg-[#FAF7F0] px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <Link to="/" className="text-sm font-medium text-[#286247]">
          ← Back to Home
        </Link>

        <div className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#C96F52]">
            Budget Meal Planning
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#252C28]">
            Plan Meals Within Your Budget
          </h1>

          <p className="mt-3 text-[#68746D]">
            Find affordable meal ideas based on your budget and household size.
          </p>
        </div>

        <section className="mt-8 rounded-2xl border border-[#E5E1D7] bg-white p-6">
          <h2 className="text-xl font-bold text-[#252C28]">
            Your Meal Preferences
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Meal Budget (₱)
              </label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={budget}
                onChange={(event) => setBudget(event.target.value)}
                className="w-full rounded-lg border border-[#E5E1D7] px-4 py-3 outline-none focus:border-[#286247]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Household Size
              </label>
              <input
                step="1"
                required
                type="number"
                min="1"
                value={householdSize}
                onChange={(event) => setHouseholdSize(event.target.value)}
                className="w-full rounded-lg border border-[#E5E1D7] px-4 py-3 outline-none focus:border-[#286247]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Meal Preference
              </label>
              <select
                value={preference}
                onChange={(event) => setPreference(event.target.value)}
                className="w-full rounded-lg border border-[#E5E1D7] bg-white px-4 py-3 outline-none focus:border-[#286247]"
              >
                <option value="All">All Meals</option>
                <option value="Chicken">Chicken</option>
                <option value="Vegetable">Vegetable</option>
                <option value="Fish">Fish</option>
              </select>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-[#252C28]">
              Suggested Meals
            </h2>
            <span className="text-sm text-[#68746D]">
              {suggestedMeals.length} meals found
            </span>
          </div>

          {!isHouseholdSizeValid && (
            <div className="mt-5 rounded-xl border border-[#C96F52] bg-[#FFF0EA] p-5">
              <p className="font-semibold text-[#C96F52]">
                Invalid household size
              </p>
              <p className="mt-2 text-sm text-[#68746D]">
                Please enter a whole number of at least 1 person.
              </p>
            </div>
          )}

          {!isBudgetValid && (
            <div className="mt-5 rounded-xl border border-[#C96F52] bg-[#FFF0EA] p-5">
              <p className="font-semibold text-[#C96F52]">
                Invalid budget
              </p>
              <p className="mt-2 text-sm text-[#68746D]">
                Please enter a valid budget of at least ₱1.
              </p>
            </div>
          )}

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {suggestedMeals.map((meal) => (
              <article
                key={meal.name}
                className="rounded-2xl border border-[#E5E1D7] bg-white p-6"
              >
                <span className="text-xs font-semibold uppercase text-[#286247]">
                  {meal.category}
                </span>

                <h3 className="mt-2 text-lg font-bold text-[#252C28]">
                  {meal.name}
                </h3>

                <p className="mt-2 text-sm text-[#68746D]">
                  {meal.description}
                </p>

                <div className="mt-5 border-t border-[#E5E1D7] pt-4">
                  <p className="text-sm text-[#68746D]">
                    Estimated cost for {people} people
                  </p>
                  <p className="mt-1 text-xl font-bold text-[#286247]">
                    ₱{(meal.cost * people).toFixed(2)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddIngredients(meal.name)}
                  className="mt-5 w-full rounded-xl bg-[#286247] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1C4635]"
                >
                  Add Ingredients to Shopping List
                </button>
              </article>
            ))}

              {isBudgetValid &&
                isHouseholdSizeValid &&
                suggestedMeals.length === 0 && (
              <div className="rounded-xl border border-[#E5E1D7] bg-white p-6 md:col-span-2">
                <p className="font-semibold text-[#252C28]">
                  No meals found within your budget.
                </p>
                <p className="mt-2 text-sm text-[#68746D]">
                  Try increasing your budget or choosing another preference.
                </p>
              </div>
            )}
          </div>
        </section>

        <p className="mt-8 text-xs text-[#68746D]">
          Note: Meal costs are sample estimates for demonstration and are not
          based on verified market prices.
        </p>
      </div>
    </main>
  )
}

export default MealPlannerPage
