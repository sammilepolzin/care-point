import { GalleryItem } from '../models/gallery.model';

export const seedInitialGallery = async (): Promise<void> => {
  try {
    const count = await GalleryItem.countDocuments();
    if (count === 0) {
      const initialPhotos = [
        {
          title: 'Fully Automated Clinical Biochemistry Laboratory',
          category: 'LABORATORY',
          imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000&auto=format&fit=crop',
          description: 'High-throughput automated analyzers ensuring zero contamination and fastest results.',
          isFeatured: true,
        },
        {
          title: 'Advanced 3.0 Tesla Silent MRI Suite',
          category: 'EQUIPMENT',
          imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=1000&auto=format&fit=crop',
          description: 'High resolution neuro and musculoskeletal scan with acoustic noise reduction.',
          isFeatured: true,
        },
        {
          title: 'Specialist Doctor Consultation Chamber',
          category: 'DOCTOR_CHAMBERS',
          imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=1000&auto=format&fit=crop',
          description: 'Private, comfortable chambers designed for attentive patient care.',
          isFeatured: false,
        },
        {
          title: 'Executive Patient Lounge & Specimen Counter',
          category: 'FACILITIES',
          imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1000&auto=format&fit=crop',
          description: 'Air-conditioned waiting area with dedicated digital token queuing display.',
          isFeatured: true,
        },
      ];

      await GalleryItem.insertMany(initialPhotos);
      console.log('🖼️ Initial facility gallery photos seeded successfully.');
    }
  } catch (error) {
    console.error('❌ Failed to seed gallery:', error);
  }
};