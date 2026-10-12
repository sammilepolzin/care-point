import { TestCategory, ITestCategory } from '../models/testCategory.model';
import { AppError } from '../errors/AppError';

export class TestCategoryService {
  public static async createCategory(data: Partial<ITestCategory>) {
    const exists = await TestCategory.findOne({ name: { $regex: new RegExp(`^${data.name}$`, 'i') } });
    if (exists) {
      throw new AppError('A category with this name already exists.', 409);
    }
    return TestCategory.create(data);
  }

  public static async getAllCategories() {
    return TestCategory.find({ isActive: true }).sort({ name: 1 });
  }

  public static async updateCategory(id: string, data: Partial<ITestCategory>) {
    if (data.name) {
      const exists = await TestCategory.findOne({
        _id: { $ne: id },
        name: { $regex: new RegExp(`^${data.name}$`, 'i') },
      });
      if (exists) {
        throw new AppError('Another category with this name already exists.', 409);
      }
    }

    const cat = await TestCategory.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!cat) {
      throw new AppError('Test category not found.', 404);
    }
    return cat;
  }

  public static async deleteCategory(id: string) {
    const cat = await TestCategory.findByIdAndDelete(id);
    if (!cat) {
      throw new AppError('Category not found.', 404);
    }
    return cat;
  }
}