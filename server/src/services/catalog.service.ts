import { CatalogProduct, IApprovedProductReader, ProductFilters } from '../types/catalog.types' // only types and the interface, never the MySQL class. that's DIP.
import { ServiceError } from './vendorApproval.service' // our shared error class that carries a status code.

type Rule = (filters: ProductFilters) => string | null // a rule returns an error text, or null when the filters are fine.

const isPositiveInt = (value: number | undefined) => value === undefined || (Number.isInteger(value) && value > 0) // undefined is fine because the filter is optional. if it's there it must be a positive whole number, and that check also catches NaN from bad input like "abc".

// OCP: to validate a new filter, add a rule here. the validate function below doesn't change.
const FILTER_RULES: Rule[] = [
  (f) => (isPositiveInt(f.categoryId) ? null : 'Invalid category.'), // categoryId has to be a positive whole number if it's given.
  (f) => (isPositiveInt(f.marketId) ? null : 'Invalid market.'), // same for marketId.
  (f) => (f.search === undefined || f.search.length <= 100 ? null : 'Search text is too long.'), // keeps search text short so nobody sends a huge string.
]

function validate(filters: ProductFilters) {
  for (const rule of FILTER_RULES) { // checks every rule in order.
    const error = rule(filters) // gets null or a message.
    if (error) throw new ServiceError(error, 400) // stops at the first problem with a 400 (bad request).
  }
}

// SRP: this service holds only the catalog rules. no sql and no req/res.
export class ProductCatalogService {
  constructor(private reader: IApprovedProductReader) {} // DIP: the reader is passed in from the routes file. a fake one works for tests.

  list(filters: ProductFilters): Promise<CatalogProduct[]> {
    validate(filters) // checks the filters first, and it throws on a problem.
    return this.reader.findApproved(filters) // gets the approved products that match.
  }

  async getById(id: number): Promise<CatalogProduct> {
    if (!Number.isInteger(id) || id <= 0) throw new ServiceError('Invalid product id.', 400) // the id from the url must be a positive whole number.
    const [product] = await this.reader.findApproved({ id }) // asks for just that one. the [product] takes the first item, or undefined if the list is empty.
    if (!product) throw new ServiceError('Product not found.', 404) // pending, rejected and missing products all look the same from the outside, so we don't leak what's waiting for review.
    return product // the single product.
  }
}
