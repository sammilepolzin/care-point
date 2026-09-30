import mongoose from 'mongoose';
import { TestBooking, ITestBooking } from '../models/testBooking.model';
import { Test } from '../models/test.model';
import { AppError } from '../errors/AppError';

export interface CreateTestBookingInput {
  patientName: string;
  patientPhone: string;
  patientAge?: number;
  patientGender?: 'MALE' | 'FEMALE' | 'OTHER';
  collectionType: 'CENTER_VISIT' | 'HOME_COLLECTION';
  collectionAddress?: string;
  collectionLandmark?: string;
  scheduledDate: string;
  scheduledTimeSlot: string;
  testIds?: string[];
  items?: Array<{
    _id?: string;
    testId?: string;
    name: string;
    code?: string;
    regularPrice: number;
    discountPrice: number;
  }>;
  paymentMethod?: string;
  notes?: string;
}

export class TestBookingService {
  public static async createBooking(input: CreateTestBookingInput): Promise<ITestBooking> {
    let testItems: any[] = [];
    let totalRegular = 0;
    let totalDiscountPrice = 0;

    // ১. ক্লায়েন্ট যদি কার্টের পুরো আইটেম পাঠায়, সেটি সরাসরি ব্যবহার করা
    if (input.items && input.items.length > 0) {
      testItems = input.items.map((i) => {
        const reg = Number(i.regularPrice) || Number(i.discountPrice) || 0;
        const disc = Number(i.discountPrice) || 0;
        totalRegular += reg;
        totalDiscountPrice += disc;
        return {
          testId: i._id || i.testId || new mongoose.Types.ObjectId(),
          name: i.name,
          code: i.code || 'TST',
          regularPrice: reg,
          discountPrice: disc,
        };
      });
    } else if (input.testIds && input.testIds.length > 0) {
      // ২. আইডি দিয়ে ডাটাবেজ থেকে খোঁজা
      const validIds = input.testIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
      const dbTests = await Test.find({ _id: { $in: validIds } });

      testItems = dbTests.map((t) => {
        totalRegular += t.regularPrice;
        totalDiscountPrice += t.discountPrice;
        return {
          testId: t._id,
          name: t.name,
          code: t.code,
          regularPrice: t.regularPrice,
          discountPrice: t.discountPrice,
        };
      });
    }

    if (testItems.length === 0) {
      throw new AppError('Please select at least one valid diagnostic test to book.', 400);
    }

    const totalDiscountAmount = Math.max(0, totalRegular - totalDiscountPrice);
    const homeCollectionFee = input.collectionType === 'HOME_COLLECTION' ? 200 : 0;
    const netPayableAmount = totalDiscountPrice + homeCollectionFee;

    const bookingId = `TST-${input.scheduledDate.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const booking = await TestBooking.create({
      bookingId,
      patientName: input.patientName,
      patientPhone: input.patientPhone,
      patientAge: Number(input.patientAge) || 28,
      patientGender: input.patientGender || 'MALE',
      collectionType: input.collectionType,
      collectionAddress: input.collectionAddress,
      collectionLandmark: input.collectionLandmark,
      scheduledDate: input.scheduledDate,
      scheduledTimeSlot: input.scheduledTimeSlot,
      tests: testItems,
      totalRegularAmount: totalRegular,
      totalDiscountAmount,
      homeCollectionFee,
      netPayableAmount,
      paymentMethod: input.paymentMethod || (input.collectionType === 'HOME_COLLECTION' ? 'CASH_ON_COLLECTION' : 'CASH_AT_CENTER'),
      paymentStatus: 'PENDING',
      status: 'PENDING',
      assignedCollector: 'Not Assigned',
      notes: input.notes,
    });

    console.log(`\n🧪 [CHECKOUT SUCCESS] Order ${booking.bookingId} created for ${booking.patientName} (৳${booking.netPayableAmount})\n`);

    return booking;
  }

  public static async getAllBookings(filter: { date?: string; phone?: string; status?: string; collectionType?: string }) {
    const query: any = {};
    if (filter.date) query.scheduledDate = filter.date;
    if (filter.phone) query.patientPhone = { $regex: filter.phone, $options: 'i' };
    if (filter.status) query.status = filter.status;
    if (filter.collectionType) query.collectionType = filter.collectionType;

    return TestBooking.find(query).sort({ createdAt: -1 });
  }

  public static async getBookingById(id: string) {
    const booking = await TestBooking.findOne({
      $or: [{ _id: id }, { bookingId: id }],
    });
    if (!booking) {
      throw new AppError('Diagnostic test booking not found.', 404);
    }
    return booking;
  }

  public static async updateBookingStatus(id: string, updateData: { status?: string; paymentStatus?: string; assignedCollector?: string }) {
    const booking = await TestBooking.findByIdAndUpdate(id, { $set: updateData }, { new: true });
    if (!booking) {
      throw new AppError('Booking not found.', 404);
    }
    return booking;
  }
}