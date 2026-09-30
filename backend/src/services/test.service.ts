import { Test, ITest } from '../models/test.model';
import { AppError } from '../errors/AppError';

export class TestService {
  public static async createTest(data: Partial<ITest>) {
    const exists = await Test.findOne({ code: data.code?.toUpperCase() });
    if (exists) {
      throw new AppError('A test with this code already exists.', 409);
    }
    return Test.create(data);
  }

  public static async getAllTests(filterOptions: { category?: string; search?: string; activeOnly?: boolean }) {
    const query: any = {};

    if (filterOptions.activeOnly) {
      query.isActive = true;
    }

    if (filterOptions.category && filterOptions.category !== 'All') {
      query.category = filterOptions.category;
    }

    if (filterOptions.search) {
      query.$or = [
        { name: { $regex: filterOptions.search, $options: 'i' } },
        { code: { $regex: filterOptions.search, $options: 'i' } },
        { category: { $regex: filterOptions.search, $options: 'i' } },
      ];
    }

    return Test.find(query).sort({ name: 1 });
  }

  public static async updateTest(id: string, data: Partial<ITest>) {
    const test = await Test.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!test) {
      throw new AppError('Diagnostic test not found.', 404);
    }
    return test;
  }

  public static async deleteTest(id: string) {
    const test = await Test.findByIdAndDelete(id);
    if (!test) {
      throw new AppError('Diagnostic test not found.', 404);
    }
    return test;
  }
}