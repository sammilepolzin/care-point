import { Department, IDepartment } from '../models/department.model';
import { AppError } from '../errors/AppError';

export class DepartmentService {
  public static async createDepartment(data: Partial<IDepartment>) {
    const exists = await Department.findOne({ name: { $regex: new RegExp(`^${data.name}$`, 'i') } });
    if (exists) {
      throw new AppError('A department with this name already exists.', 409);
    }
    return Department.create(data);
  }

  public static async getAllDepartments(onlyActive = false) {
    const filter = onlyActive ? { isActive: true } : {};
    return Department.find(filter).sort({ name: 1 });
  }

  public static async updateDepartment(id: string, data: Partial<IDepartment>) {
    if (data.name) {
      const exists = await Department.findOne({
        _id: { $ne: id },
        name: { $regex: new RegExp(`^${data.name}$`, 'i') },
      });
      if (exists) {
        throw new AppError('Another department with this name already exists.', 409);
      }
    }

    const dept = await Department.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!dept) {
      throw new AppError('Department not found.', 404);
    }
    return dept;
  }

  public static async toggleStatus(id: string) {
    const dept = await Department.findById(id);
    if (!dept) {
      throw new AppError('Department not found.', 404);
    }
    dept.isActive = !dept.isActive;
    await dept.save();
    return dept;
  }

  public static async deleteDepartment(id: string) {
    const dept = await Department.findByIdAndDelete(id);
    if (!dept) {
      throw new AppError('Department not found.', 404);
    }
    return dept;
  }
}