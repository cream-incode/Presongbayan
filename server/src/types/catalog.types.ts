// what a customer sees for one approved product. id, name, price and unit use the same names as the Product type in your data/ingredients.ts, so the shopping list page can switch over easily.
export interface CatalogProduct {
  id: number // the product's id. the shopping list uses it as the key.
  name: string // product_name, like "Regular Rice".
  brand: string // empty string if the vendor left it blank.
  packageSize: number // how much is in one pack. it's a decimal in the db so we turn it into a number.
  unit: string // unit for that size, like kg or piece.
  price: number // the live price (current_price). it only changes when an admin approves a price update.
  isAvailable: boolean // true means in stock. out-of-stock products are still listed so customers can see them.
  categoryId: number // joined from product_category, useful for filtering later.
  categoryName: string // like "Vegetables".
  stallId: number // which stall sells it.
  stallName: string // the stall's label.
  marketId: number // which market the stall is in.
  marketName: string // the market's name, so customers can compare prices across markets.
  marketLocation: string // where the market is.
  lastUpdated: string // when the product last changed. customers can tell how fresh a price is.
}

// the filters a request can use. every field is optional, so no filters at all gives the full list.
export interface ProductFilters {
  id?: number // used by the single-product lookup.
  categoryId?: number // only products in this category.
  marketId?: number // only products sold in this market.
  search?: string // part of the product name, like "rice".
  availableOnly?: boolean // true hides out-of-stock products.
}

// ISP: the catalog only needs to read, so the interface has one method. no create or delete here, because customers can't change anything.
export interface IApprovedProductReader {
  findApproved(filters: ProductFilters): Promise<CatalogProduct[]> // returns only approved products from approved vendors, matching the filters.
}
