import { Test } from '../models/test.model';

export const seedInitialTests = async (): Promise<void> => {
  try {
    const count = await Test.countDocuments();
    if (count === 0) {
      const initialTests = [
        {
          name: 'Complete Blood Count (CBC with ESR)',
          code: 'CBC-01',
          category: 'Hematology',
          preparationInstructions: 'No fasting required',
          sampleType: 'Blood (EDTA)',
          reportDeliveryTime: 'Same Day (4 Hours)',
          regularPrice: 450,
          discountPrice: 380,
          homeCollectionAvailable: true,
          isActive: true,
        },
        {
          name: 'Lipid Profile Comprehensive Panel',
          code: 'LIPID-02',
          category: 'Biochemistry',
          preparationInstructions: '10-12 Hours fasting required',
          sampleType: 'Blood (Serum)',
          reportDeliveryTime: 'Same Day (6 Hours)',
          regularPrice: 1300,
          discountPrice: 990,
          homeCollectionAvailable: true,
          isActive: true,
        },
        {
          name: 'HbA1c & Fasting Blood Sugar (FBS)',
          code: 'HBA1C-03',
          category: 'Diabetes Care',
          preparationInstructions: 'Overnight fasting required',
          sampleType: 'Blood (Fluoride & EDTA)',
          reportDeliveryTime: '3 Hours',
          regularPrice: 900,
          discountPrice: 750,
          homeCollectionAvailable: true,
          isActive: true,
        },
        {
          name: 'Thyroid Function Panel (TSH, FT3, FT4)',
          code: 'THYROID-04',
          category: 'Endocrinology',
          preparationInstructions: 'Morning sample preferred',
          sampleType: 'Blood (Clot Tube)',
          reportDeliveryTime: 'Within 24 Hours',
          regularPrice: 1600,
          discountPrice: 1250,
          homeCollectionAvailable: true,
          isActive: true,
        },
        {
          name: 'Serum Creatinine with eGFR & Urea',
          code: 'CREAT-05',
          category: 'Kidney Function',
          preparationInstructions: 'Normal diet',
          sampleType: 'Blood (Serum)',
          reportDeliveryTime: 'Same Day (3 Hours)',
          regularPrice: 600,
          discountPrice: 450,
          homeCollectionAvailable: true,
          isActive: true,
        },
        {
          name: 'High-Resolution Digital Chest X-Ray',
          code: 'XRAY-06',
          category: 'Radiology',
          preparationInstructions: 'Wear metal-free comfortable clothing',
          sampleType: 'Digital Imaging Film',
          reportDeliveryTime: 'Within 2 Hours',
          regularPrice: 750,
          discountPrice: 600,
          homeCollectionAvailable: false,
          isActive: true,
        },
        {
          name: '4D Whole Abdomen Ultrasonography (USG)',
          code: 'USG-07',
          category: 'Radiology & Imaging',
          preparationInstructions: 'Full bladder & overnight fasting',
          sampleType: 'Ultrasound Scan',
          reportDeliveryTime: 'Instant Report',
          regularPrice: 1800,
          discountPrice: 1500,
          homeCollectionAvailable: false,
          isActive: true,
        },
        {
          name: 'Brain & Spine 3.0 Tesla MRI Scan',
          code: 'MRI-08',
          category: 'Advanced Imaging',
          preparationInstructions: 'No metal implants/pacemakers allowed',
          sampleType: 'Magnetic Resonance Imaging',
          reportDeliveryTime: 'Within 24 Hours',
          regularPrice: 6500,
          discountPrice: 5500,
          homeCollectionAvailable: false,
          isActive: true,
        },
      ];

      await Test.insertMany(initialTests);
      console.log('🧪 Initial diagnostic tests seeded successfully into database.');
    }
  } catch (error) {
    console.error('❌ Failed to seed initial diagnostic tests:', error);
  }
};