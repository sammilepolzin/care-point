import { Offer, IOffer } from '../models/offer.model';
import { AppError } from '../errors/AppError';

export class OfferService {
  public static async createOffer(data: Partial<IOffer>) {
    return Offer.create({
      ...data,
      couponCode: data.couponCode?.toUpperCase(),
    });
  }

  public static async getAllOffers(onlyActive = true) {
    const query = onlyActive ? { isActive: true } : {};
    return Offer.find(query).sort({ createdAt: -1 });
  }

  public static async updateOffer(id: string, data: Partial<IOffer>) {
    const offer = await Offer.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!offer) {
      throw new AppError('Special offer not found.', 404);
    }
    return offer;
  }

  public static async deleteOffer(id: string) {
    const offer = await Offer.findByIdAndDelete(id);
    if (!offer) {
      throw new AppError('Offer not found.', 404);
    }
    return offer;
  }
}