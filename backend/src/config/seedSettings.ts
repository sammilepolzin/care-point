import { Settings } from '../models/settings.model';

export const seedInitialSettings = async (): Promise<void> => {
  try {
    const existing = await Settings.findOne();
    if (!existing) {
      await Settings.create({
        siteName: 'Care Point',
        tagline: 'Diagnostic & Consultation Centre',
        hotline: '09666 787801',
        supportPhone: '+880 1700-000000',
        email: 'info@carepoint.com',
        address: 'House 42, Road 11, Dhanmondi, Dhaka - 1209, Bangladesh',
        whatsappNumber: '8801700000000',
        heroSlides: [
          {
            id: 'slide-1',
            imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1920&auto=format&fit=crop',
            title: 'Modern Diagnostic Precision',
            subtitle: 'International gold-standard automated pathology and 3.0T MRI imaging.',
            linkUrl: '/appointment',
            order: 1,
          },
          {
            id: 'slide-2',
            imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1920&auto=format&fit=crop',
            title: 'Renowned Specialist Doctors',
            subtitle: 'Daily morning and evening chamber consultations with verified serials.',
            linkUrl: '/doctors',
            order: 2,
          },
          {
            id: 'slide-3',
            imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=1920&auto=format&fit=crop',
            title: 'Doorstep Home Sample Pickup',
            subtitle: 'Certified phlebotomists collecting blood & pathology samples from your home.',
            linkUrl: '/test-booking',
            order: 3,
          },
        ],
        mission: {
          title: 'Precision Diagnostic Healthcare for All',
          description:
            'To provide accurate, fast, and affordable diagnostic investigations using global gold-standard automated technology, while upholding the highest medical ethics.',
          points: [
            'Uncompromised clinical accuracy through internal & external quality control.',
            'Zero-contamination fully automated analyzers from Germany & Japan.',
            'Affordable pricing with inclusive health checkup packages.',
            'Compassionate, respectful, and patient-first medical service.',
          ],
        },
        vision: {
          title: 'The Most Trusted Diagnostic Landmark in the Nation',
          description:
            'To be recognized as Bangladesh’s benchmark diagnostic hub, pioneering artificial intelligence in digital radiology and setting new standards in clinical pathology.',
          points: [
            'Setting gold-standard laboratory automation across all clinical disciplines.',
            'Digitizing patient medical records with instant secure online delivery.',
            'Expanding certified doorstep sample collection services nationwide.',
          ],
        },
        technologies: [
          {
            name: 'Cobas e411 & c311 Analyzer Suite',
            model: 'Roche Diagnostics (Germany)',
            manufacturer: 'F. Hoffmann-La Roche AG',
            description:
              'Fully automated electrochemiluminescence (ECLIA) immunoassay and clinical chemistry analyzer ensuring zero cross-contamination.',
            imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop',
          },
          {
            name: 'Sysmex XN-550 Automated Hematology',
            model: 'Sysmex Corporation (Japan)',
            manufacturer: 'Sysmex Japan',
            description:
              '5-part differential blood analyzer using fluorescent flow cytometry for accurate detection of immature cells and platelets.',
            imageUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=800&auto=format&fit=crop',
          },
          {
            name: 'Siemens Magnetom 3.0 Tesla MRI',
            model: 'Siemens Healthineers (Germany)',
            manufacturer: 'Siemens AG',
            description:
              'High-density ultra-quiet magnetic resonance imaging system providing sub-millimeter structural visualization for brain and spine.',
            imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=800&auto=format&fit=crop',
          },
          {
            name: 'GE Voluson E10 4D HD-Live USG',
            model: 'GE Healthcare (USA)',
            manufacturer: 'General Electric',
            description:
              'Matrix electronic 4D ultrasonography with HD-live silhouette rendering for detailed fetal anatomical screening and vascular Doppler.',
            imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&auto=format&fit=crop',
          },
        ],
        managementTeam: [
          {
            name: 'Prof. Dr. M. A. Rahim',
            designation: 'Chairman of the Board',
            degrees: 'MBBS, FCPS, FRCP (Glasgow)',
            bio: 'Over 30 years of clinical and academic leadership in internal medicine and clinical pathology.',
            photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=500&auto=format&fit=crop',
          },
          {
            name: 'Engr. Tariqul Islam',
            designation: 'Managing Director & CEO',
            degrees: 'B.Sc Engr (BUET), MBA (DU)',
            bio: 'Pioneered healthcare digitization and clinical logistics management in private healthcare sectors.',
            photoUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=500&auto=format&fit=crop',
          },
          {
            name: 'Dr. Shamima Nasrin',
            designation: 'Director of Laboratory Services',
            degrees: 'MBBS, M.Phil (Pathology)',
            bio: 'Chief quality auditor overseeing multi-tier clinical laboratory certifications and analyzer validations.',
            photoUrl: 'https://images.unsplash.com/photo-1594824813583-059e0a0584b8?q=80&w=500&auto=format&fit=crop',
          },
        ],
        showDoctorFees: true,
      });
      console.log('⚙️ Master Business Settings & Seed Data successfully initialized in database.');
    }
  } catch (error) {
    console.error('❌ Failed to seed settings:', error);
  }
};