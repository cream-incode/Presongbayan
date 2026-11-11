
export type Product = {
    id: number
    name: string
    price: number
    unit: string
  }
  
  export type MealIngredient = {
    productId: number
    quantity: number
  }
  
  // Sample product catalog and estimated prices.
  // These are prototype values, not verified market prices.
  export const products: Product[] = [
    { id: 1, name: 'Regular Rice', price: 48, unit: 'kg' },
    { id: 2, name: 'White Eggs', price: 9, unit: 'piece' },
    { id: 3, name: 'Tomatoes', price: 65, unit: 'kg' },
    { id: 4, name: 'Chicken', price: 180, unit: 'kg' },
    { id: 5, name: 'Cooking Oil', price: 95, unit: 'liter' },
    { id: 6, name: 'Mung Beans', price: 120, unit: 'kg' },
    { id: 7, name: 'Fish', price: 160, unit: 'kg' },
    { id: 8, name: 'Garlic', price: 180, unit: 'kg' },
    { id: 9, name: 'Onion', price: 100, unit: 'kg' },
    { id: 10, name: 'Soy Sauce', price: 45, unit: 'liter' },
    { id: 11, name: 'Vinegar', price: 35, unit: 'liter' },
    { id: 12, name: 'Leafy Vegetables', price: 50, unit: 'kg' },
    { id: 13, name: 'Mixed Vegetables', price: 80, unit: 'kg' },
  ]
  
  // Ingredient quantities are sample estimates per person.
  export const mealIngredients: Record<string, MealIngredient[]> = {
    'Chicken Adobo': [
      { productId: 1, quantity: 0.1 },
      { productId: 4, quantity: 0.15 },
      { productId: 8, quantity: 0.01 },
      { productId: 10, quantity: 0.02 },
      { productId: 11, quantity: 0.02 },
    ],
  
    'Ginisang Monggo': [
      { productId: 1, quantity: 0.1 },
      { productId: 6, quantity: 0.05 },
      { productId: 3, quantity: 0.03 },
      { productId: 8, quantity: 0.01 },
      { productId: 9, quantity: 0.02 },
      { productId: 12, quantity: 0.03 },
    ],
  
    'Sinigang na Isda': [
      { productId: 1, quantity: 0.1 },
      { productId: 7, quantity: 0.15 },
      { productId: 3, quantity: 0.05 },
      { productId: 9, quantity: 0.02 },
      { productId: 13, quantity: 0.1 },
    ],
  
    Chopsuey: [
      { productId: 1, quantity: 0.1 },
      { productId: 13, quantity: 0.15 },
      { productId: 4, quantity: 0.05 },
      { productId: 5, quantity: 0.01 },
      { productId: 8, quantity: 0.01 },
      { productId: 9, quantity: 0.02 },
      { productId: 10, quantity: 0.01 },
    ],
  }
  