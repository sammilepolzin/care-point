import { Package } from '../models/package.model';
import { Offer } from '../models/offer.model';
import { Test } from '../models/test.model';

export const seedInitialPackagesAndOffers = async (): Promise<void> => {
  try {
    const count = await Package.countDocuments();
    if (count === 0) {
      const tests = await Test.find().limit(5);
      const testIds = tests.map((t) => t._id);

      const defaultPackages = [
        {
          name: 'Executive Master Health Checkup',
          code: 'PKG-EXEC-01',
          tagline: 'Complete 360° Body & Organ Screening',
          description: 'Includes CBC, Lipid Profile, Liver Function, Kidney Function, HbA1c, Urine Analysis & Specialist Consultation.',
          genderTarget: 'ALL',
          ageGroup: '30+ Years',
          includedFeatures: ['32 Clinical Parameters', 'Same-Day Fast Delivery', 'Free Doctor Consultation', 'Complimentary Breakfast'],
          includedTests: testIds,
          regularPrice: 6500,
          packagePrice: 4500,
          discountPercentage: 31,
          isPopular: true,
          isActive: true,
        },
        {
          name: 'Comprehensive Cardiac Care Package',
          code: 'PKG-CARD-02',
          tagline: 'Heart Health & Lipid Risk Assessment',
          description: 'Specialized package for hypertension, cholesterol, and heart disease screening with digital ECG.',
          genderTarget: 'ALL',
          ageGroup: '40+ Years',
          includedFeatures: ['Lipid Comprehensive Panel', 'ECG 12-Lead Digital', 'Blood Sugar & Creatinine', 'Senior Cardiologist Review'],
          includedTests: testIds.slice(0, 3),
          regularPrice: 4200,
          packagePrice: 2900,
          discountPercentage: 30,
          isPopular: true,
          isActive: true,
        },
        {
          name: 'Diabetic Wellness & Screening Panel',
          code: 'PKG-DIAB-03',
          tagline: 'Targeted Glycemic & Renal Health Panel',
          description: 'Fasting Glucose, HbA1c, Serum Creatinine, Urine Microalbumin & Lipid Profile for diabetic management.',
          genderTarget: 'ALL',
          ageGroup: 'All Ages',
          includedFeatures: ['HbA1c & Fasting Sugar', 'Kidney & Lipid Screening', 'Doorstep Sample Collection Eligible'],
          includedTests: testIds.slice(0, 2),
          regularPrice: 2800,
          packagePrice: 1950,
          discountPercentage: 30,
          isPopular: false,
          isActive: true,
        },
      ];

      await Package.insertMany(defaultPackages);
      console.log('📦 Initial Health Packages seeded successfully into database.');
    }

    const offerCount = await Offer.countDocuments();
    if (offerCount === 0) {
      await Offer.create({
        title: 'Special 20% Discount on All Pathology Tests',
        subtitle: 'Use code CARE20 during checkout or home collection booking',
        couponCode: 'CARE20',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        startDate: '2026-09-01',
        endDate: '2026-12-31',
        isActive: true,
      });
      console.log('🏷️ Promotional Offer campaign initialized in database.');
    }
  } catch (error) {
    console.error('❌ Failed to seed packages/offers:', error);
  }
};