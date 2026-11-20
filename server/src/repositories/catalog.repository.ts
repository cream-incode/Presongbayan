import { RowDataPacket } from 'mysql2/promise' // the type for select rows. from the promise version to match your pool.
import { db } from '../config/db' // your pool from config/db.ts, a named export.
import { CatalogProduct, IApprovedProductReader, ProductFilters } from '../types/catalog.types' // our types and the interface this class follows.

// one filter = one rule. "applies" says if the request used it, "sql" is the fixed condition text, and "param" gives the value for the ?.
type FilterRule = {
  applies: (filters: ProductFilters) => boolean // true when the request asked for this filter.
  sql: string // the condition we add to the WHERE. it's always our own text, never anything from the user.
  param?: (filters: ProductFilters) => unknown // the value that fills the ?. a rule with no ? (like availableOnly) doesn't need one.
}

// OCP: to add a new filter later (like a max price) you just add a rule here. the query builder below doesn't change.
const FILTER_RULES: FilterRule[] = [
  { applies: (f) => f.id !== undefined, sql: 'p.id = ?', param: (f) => f.id }, // one specific product.
  { applies: (f) => f.categoryId !== undefined, sql: 'p.category_id = ?', param: (f) => f.categoryId }, // one category.
  { applies: (f) => f.marketId !== undefined, sql: 's.market_id = ?', param: (f) => f.marketId }, // one market, through the stall.
  { applies: (f) => f.search !== undefined, sql: 'p.product_name LIKE ?', param: (f) => `%${f.search}%` }, // the % on both sides means "contains". the value still goes through the ?, so it's safe from SQL injection.
  { applies: (f) => f.availableOnly === true, sql: 'p.is_available = 1' }, // hides out-of-stock products. no value needed here.
]

// SRP: this class only reads the approved products from MySQL. no validation and no http.
export class MySqlCatalogRepository implements IApprovedProductReader {
  async findApproved(filters: ProductFilters): Promise<CatalogProduct[]> {
    const conditions = ["p.approval_status = 'approved'", "v.approval_status = 'approved'"] // the 2 conditions that are ALWAYS there. the product must be approved, and so must its vendor.
    const params: unknown[] = [] // the values for the ?s, in the same order as the conditions.

    for (const rule of FILTER_RULES) { // goes through every possible filter.
      if (!rule.applies(filters)) continue // skips the ones the request didn't use.
      conditions.push(rule.sql) // adds the condition text.
      if (rule.param) params.push(rule.param(filters)) // adds its value, if it has one.
    }

    const [rows] = await db.query<RowDataPacket[]>( // runs the select.
      `SELECT p.id, p.product_name, p.brand, p.package_size, p.unit, p.current_price,
              p.is_available, p.last_updated,
              c.id AS category_id, c.category_name,
              s.id AS stall_id, s.stall_name,
              m.id AS market_id, m.market_name, m.location AS market_location
       FROM product p
       JOIN product_category c ON p.category_id = c.id
       JOIN stall s ON p.stall_id = s.id
       JOIN market m ON s.market_id = m.id
       JOIN vendor v ON s.vendor_id = v.id
       WHERE ${conditions.join(' AND ')}
       ORDER BY p.product_name ASC, p.current_price ASC`, // the JOINs bring in the category, stall, market and vendor. the conditions are joined with AND. sorted by name then cheapest first, which is handy for comparing prices.
      params // fills every ? in order.
    )

    return rows.map((row) => ({ // turns each db row into a CatalogProduct.
      id: row.id, // already named id.
      name: row.product_name, // product_name becomes name, to match your frontend's Product type.
      brand: row.brand ?? '', // NULL in the db becomes ''. the ?? only kicks in for null or undefined.
      packageSize: Number(row.package_size), // DECIMAL comes back from mysql2 as a string, so Number() fixes it.
      unit: row.unit, // no change needed.
      price: Number(row.current_price), // same DECIMAL fix. current_price becomes price.
      isAvailable: Boolean(row.is_available), // MySQL stores 0 or 1, and Boolean() turns that into true or false.
      categoryId: row.category_id, // from the alias in the SELECT.
      categoryName: row.category_name, // from the category JOIN.
      stallId: row.stall_id, // from the alias.
      stallName: row.stall_name, // from the stall JOIN.
      marketId: row.market_id, // from the alias.
      marketName: row.market_name, // from the market JOIN.
      marketLocation: row.market_location, // the alias we made for location.
      lastUpdated: row.last_updated, // the datetime as it is.
    }))
  }
}
