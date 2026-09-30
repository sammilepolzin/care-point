import { GalleryItem, IGalleryItem } from '../models/gallery.model';
import { AppError } from '../errors/AppError';

export class GalleryService {
  public static async createItem(data: Partial<IGalleryItem>) {
    return GalleryItem.create(data);
  }

  public static async getAllItems(category?: string) {
    const query = category && category !== 'ALL' ? { category } : {};
    return GalleryItem.find(query).sort({ isFeatured: -1, createdAt: -1 });
  }

  // গ্যালারি ফটো এডিট মেথড
  public static async updateItem(id: string, data: Partial<IGalleryItem>) {
    const item = await GalleryItem.findByIdAndUpdate(id, { $set: data }, { new: true });
    if (!item) throw new AppError('Gallery item not found', 404);
    return item;
  }

  public static async deleteItem(id: string) {
    const item = await GalleryItem.findByIdAndDelete(id);
    if (!item) throw new AppError('Gallery item not found', 404);
    return item;
  }
}