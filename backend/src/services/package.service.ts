import { Package, IPackage } from '../models/package.model';
import { AppError } from '../errors/AppError';

export class PackageService {
  public static async createPackage(data: Partial<IPackage>) {
    const exists = await Package.findOne({ code: data.code?.toUpperCase() });
    if (exists) {
      throw new AppError('A health package with this code already exists.', 409);
    }

    const reg = data.regularPrice || 0;
    const pkg = data.packagePrice || 0;
    const discountPercentage = reg > pkg ? Math.round(((reg - pkg) / reg) * 100) : 0;

    return Package.create({
      ...data,
      code: data.code?.toUpperCase(),
      discountPercentage,
    });
  }

  public static async getAllPackages(onlyActive = true) {
    const query = onlyActive ? { isActive: true } : {};
    return Package.find(query).populate('includedTests').sort({ isPopular: -1, createdAt: -1 });
  }

  public static async getById(id: string) {
    const pkg = await Package.findById(id).populate('includedTests');
    if (!pkg) {
      throw new AppError('Health package not found.', 404);
    }
    return pkg;
  }

  public static async updatePackage(id: string, data: Partial<IPackage>) {
    if (data.regularPrice && data.packagePrice) {
      data.discountPercentage = data.regularPrice > data.packagePrice
        ? Math.round(((data.regularPrice - data.packagePrice) / data.regularPrice) * 100)
        : 0;
    }

    const pkg = await Package.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate('includedTests');
    if (!pkg) {
      throw new AppError('Package not found.', 404);
    }
    return pkg;
  }

  public static async deletePackage(id: string) {
    const pkg = await Package.findByIdAndDelete(id);
    if (!pkg) {
      throw new AppError('Package not found.', 404);
    }
    return pkg;
  }
}