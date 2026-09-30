import { Request, Response } from 'express';
import { OfferService } from '../services/offer.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendResponse } from '../utils/apiResponse';

export const createOffer = asyncHandler(async (req: Request, res: Response) => {
  const offer = await OfferService.createOffer(req.body);
  sendResponse({
    res,
    statusCode: 201,
    message: 'Special offer created successfully',
    data: offer,
  });
});

export const getAllOffers = asyncHandler(async (req: Request, res: Response) => {
  const onlyActive = req.query.all !== 'true';
  const offers = await OfferService.getAllOffers(onlyActive);
  sendResponse({
    res,
    statusCode: 200,
    message: 'Special offers retrieved successfully',
    data: offers,
  });
});

export const updateOffer = asyncHandler(async (req: Request, res: Response) => {
  const offer = await OfferService.updateOffer(req.params.id, req.body);
  sendResponse({
    res,
    statusCode: 200,
    message: 'Special offer updated successfully',
    data: offer,
  });
});

export const deleteOffer = asyncHandler(async (req: Request, res: Response) => {
  await OfferService.deleteOffer(req.params.id);
  sendResponse({
    res,
    statusCode: 200,
    message: 'Offer deleted successfully',
  });
});

export const OfferController = {
  create: createOffer,
  getAll: getAllOffers,
  update: updateOffer,
  delete: deleteOffer,
};

export default OfferController;