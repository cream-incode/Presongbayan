import { Request, Response } from 'express' // types for req and res.
import { PriceSubmissionService } from '../services/priceSubmission.service' // the vendor-side service. the controller only calls it.
import { getVendorId, sendError } from '../utils/requestHelpers' // gets the vendor id from the token, and turns errors into responses.

// SRP: only http in and out for the vendor's price submissions. DIP: the service gets passed in from the routes file.
export function createPriceSubmissionController(service: PriceSubmissionService) {
  return {
    async listMine(req: Request, res: Response) {
      try {
        const submissions = await service.listMine(getVendorId(req)) // the id comes from the token, so a vendor can only ever see their own.
        res.json({ submissions }) // wrapped in an object so we can add fields later.
      } catch (error) {
        sendError(res, error, 'Could not load your submissions.') // picks the status code and message.
      }
    },

    async submit(req: Request, res: Response) {
      try {
        const { productId, proposedPrice } = req.body as { productId: number; proposedPrice: number } // reads the two fields from the json body.
        const id = await service.submit(getVendorId(req), Number(productId), Number(proposedPrice)) // Number() because json from a form can arrive as strings.
        res.status(201).json({ message: 'Price submitted for review.', id }) // 201 means created, and we return the new id.
      } catch (error) {
        sendError(res, error, 'Could not submit the price.') // handles the 400 and 404 from the service.
      }
    },

    async changePrice(req: Request, res: Response) {
      try {
        const { proposedPrice } = req.body as { proposedPrice: number } // only the price can be edited.
        await service.changePrice(Number(req.params.id), getVendorId(req), Number(proposedPrice)) // url params are strings so Number() makes the id a number.
        res.json({ message: 'Submission updated.' }) // confirms it worked.
      } catch (error) {
        sendError(res, error, 'Could not update the submission.') // same handling as above.
      }
    },

    async cancel(req: Request, res: Response) {
      try {
        await service.cancel(Number(req.params.id), getVendorId(req)) // deletes only an unreviewed submission that belongs to this vendor.
        res.json({ message: 'Submission cancelled.' }) // confirms the delete.
      } catch (error) {
        sendError(res, error, 'Could not cancel the submission.') // a 404 shows up if it's already reviewed.
      }
    },
  }
}
