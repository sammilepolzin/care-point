import React from 'react';
import { HeroSection } from '../components/HeroSection';
import { FeaturedDoctors } from '../components/FeaturedDoctors';
import { SpecialtiesGrid } from '../components/SpecialtiesGrid';
import { AllDoctorsSection } from '../components/AllDoctorsSection';
import { PopularTests } from '../components/PopularTests';
import { WhyChooseUs } from '../components/WhyChooseUs';

export const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero with Slider & Dynamic 3-Tab Filter */}
      <HeroSection />

      {/* 2. Today's Available Doctors Section */}
      <FeaturedDoctors />

      {/* 3. Medical Departments & Clinical Specialties Grid */}
      <SpecialtiesGrid />

      {/* 4. Our Specialist Doctor Panel (All Doctors Showcase) */}
      <AllDoctorsSection />

      {/* 5. Popular Pathology & Diagnostic Tests Grid */}
      <PopularTests />

      {/* 6. Why Choose Us Section */}
      <WhyChooseUs />
    </div>
  );
};