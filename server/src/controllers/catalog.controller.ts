import { Request, Response } from 'express' // types for req and res.
import { ProductCatalogService } from '../services/catalog.service' // the service that does the real work.
import { ProductFilters } from '../types/catalog.types' // the shape of the filters.
import { sendError } from '../utils/requestHelpers' // turns errors into http responses. we don't need getVendorId here because this endpoint is public.

// query strings always arrive as text, so these two tiny helpers turn them into the right types. they return undefined when the value is missing or blank.
const asText = (value: unknown) => (typeof value === 'string' && value.trim() ? value.trim() : undefined) // keeps only non-empty strings and trims the spaces.
const asNumber = (value: unknown) => (typeof value === 'string' && value.trim() ? Number(value) : undefined) // turns "3" into 3. bad input like "abc" becomes NaN, and the service rejects that with a 400.

// reads the filters out of the url, like ?categoryId=3&search=rice. this is an http job, so it lives in the controller and not in the service.
function toFilters(query: Request['query']): ProductFilters {
  return {
    categoryId: asNumber(query.categoryId), // ?categoryId=3
    marketId: asNumber(query.marketId), // ?marketId=1
    search: asText(query.search), // ?search=rice
    availableOnly: query.availableOnly === 'true', // ?availableOnly=true hides out-of-stock items. anything else means false.
  }
}

// SRP: only http in and out. DIP: the service is passed in from the routes file.
export function createCatalogController(service: ProductCatalogService) {
  return {
    async list(req: Request, res: Response) {
      try {
        const products = await service.list(toFilters(req.query)) // asks the service with the filters from the url.
        res.json({ products }) // wrapped in an object so we can add fields like a total later.
      } catch (error) {
        sendError(res, error, 'Could not load products.') // picks the right status code and message.
      }
    },

    async getOne(req: Request, res: Response) {
      try {
        const product = await service.getById(Number(req.params.id)) // url params are strings, so Number() makes the id a number.
        res.json({ product }) // the single product.
      } catch (error) {
        sendError(res, error, 'Could not load the product.') // a 404 shows up if it's missing or not approved.
      }
    },
  }
}
