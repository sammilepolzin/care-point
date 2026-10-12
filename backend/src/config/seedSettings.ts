import { Settings } from '../models/settings.model';

export const seedInitialSettings = async (): Promise<void> => {
  try {
    const existing = await Settings.findOne();
    if (!existing) {
      // 100% Clean Seed - ZERO Hardcoded Photos/Banners
      await Settings.create({
        siteName: 'Care Point',
        tagline: 'Diagnostic & Consultation Centre',
        logoUrl: '',
        footerLogoUrl: '',
        faviconUrl: '',
        loaderLogoUrl: '',
        topbarHotlineText: '09666 787801',
        topbarStatusText: 'Online Services: Active 24/7',
        topbarCertText: 'ISO 9001:2015 Certified',
        hotline: '09666 787801',
        supportPhone: '+880 1700-000000',
        emergencyPhone: '10678',
        email: 'info@carepoint.com',
        address: 'House 42, Road 11, Dhanmondi, Dhaka - 1209, Bangladesh',
        whatsappNumber: '8801700000000',
        whatsappDefaultMessage: 'Hello Care Point Diagnostic, I would like to inquire about your services.',
        customSocialLinks: [
          { id: '1', platform: 'Facebook', url: 'https://facebook.com', iconUrl: '' },
          { id: '2', platform: 'YouTube', url: 'https://youtube.com', iconUrl: '' },
          { id: '3', platform: 'LinkedIn', url: 'https://linkedin.com', iconUrl: '' }
        ],
        heroSlides: [], // ZERO hardcoded slides
        technologies: [], // ZERO hardcoded technologies
        managementTeam: [], // ZERO hardcoded members
        mission: {
          title: 'Precision Diagnostic Healthcare for All',
          description: 'To provide accurate, fast, and affordable diagnostic investigations.',
          points: []
        },
        vision: {
          title: 'The Benchmark of Diagnostic Trust',
          description: 'To be recognized as Bangladesh’s benchmark diagnostic hub.',
          points: []
        },
        showDoctorFees: true,
      });
      console.log('⚙️ Master Settings initialized cleanly in database.');
    }
  } catch (error) {
    console.error('❌ Failed to seed settings:', error);
  }
};