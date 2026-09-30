import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { PatientLayout } from '@/layouts/PatientLayout';
import { HomePage } from '@/features/home/pages/HomePage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { DoctorListPage } from '@/features/doctors/pages/DoctorListPage';
import { TodayDoctorsPage } from '@/features/doctors/pages/TodayDoctorsPage';
import { DepartmentListPage } from '@/features/departments/pages/DepartmentListPage';
import { DoctorAppointmentPage } from '@/features/appointments/pages/DoctorAppointmentPage';
import { TestListPage } from '@/features/tests/pages/TestListPage';
import { TestBookingCheckoutPage } from '@/features/tests/pages/TestBookingCheckoutPage';
import { ReportSearchPage } from '@/features/reports/pages/ReportSearchPage';
import { HealthPackagesPage } from '@/features/packages/pages/HealthPackagesPage';
import { SpecialOffersPage } from '@/features/packages/pages/SpecialOffersPage';
import { AboutUsPage } from '@/features/public/pages/AboutUsPage';
import { MissionPage } from '@/features/public/pages/MissionPage';
import { ChairmanMessagePage } from '@/features/public/pages/ChairmanMessagePage';
import { ManagingDirectorPage } from '@/features/public/pages/ManagingDirectorPage';
import { TechnologiesPage } from '@/features/public/pages/TechnologiesPage';
import { TechnologyDetailPage } from '@/features/public/pages/TechnologyDetailPage';
import { ManagementTeamPage } from '@/features/public/pages/ManagementTeamPage';
import { GalleryPage } from '@/features/public/pages/GalleryPage';
import { ContactUsPage } from '@/features/public/pages/ContactUsPage';
import { PatientDashboardPage } from '@/features/patient/pages/PatientDashboardPage';
import { DoctorPrescriptionBuilderPage } from '@/features/prescriptions/pages/DoctorPrescriptionBuilderPage';
import { AdminDashboardPage } from '@/features/admin/pages/AdminDashboardPage';
import { DepartmentsPage } from '@/features/admin/pages/DepartmentsPage';
import { DoctorsManagementPage } from '@/features/admin/pages/DoctorsManagementPage';
import { DoctorSchedulesPage } from '@/features/admin/pages/DoctorSchedulesPage';
import { AppointmentsPage } from '@/features/admin/pages/AppointmentsPage';
import { TestsManagementPage } from '@/features/admin/pages/TestsManagementPage';
import { TestCategoriesPage } from '@/features/admin/pages/TestCategoriesPage';
import { PackagesManagementPage } from '@/features/admin/pages/PackagesManagementPage';
import { OffersManagementPage } from '@/features/admin/pages/OffersManagementPage';
import { TestBookingsPage } from '@/features/admin/pages/TestBookingsPage';
import { ReportsManagementPage } from '@/features/admin/pages/ReportsManagementPage';
import { ContactMessagesPage } from '@/features/admin/pages/ContactMessagesPage';
import { GalleryManagementPage } from '@/features/admin/pages/GalleryManagementPage';
import { SettingsPage } from '@/features/admin/pages/SettingsPage';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/today-doctors" element={<TodayDoctorsPage />} />
        <Route path="/doctors" element={<DoctorListPage />} />
        <Route path="/doctors/:id/book" element={<DoctorAppointmentPage />} />
        <Route path="/appointment" element={<DoctorAppointmentPage />} />
        <Route path="/departments" element={<DepartmentListPage />} />
        <Route path="/tests" element={<TestListPage />} />
        <Route path="/test-booking" element={<TestBookingCheckoutPage />} />
        <Route path="/packages" element={<HealthPackagesPage />} />
        <Route path="/offers" element={<SpecialOffersPage />} />
        <Route path="/about" element={<AboutUsPage />} />
        
        {/* Institutional & Technology Routes */}
        <Route path="/mission" element={<MissionPage />} />
        <Route path="/chairman-message" element={<ChairmanMessagePage />} />
        <Route path="/managing-director" element={<ManagingDirectorPage />} />
        <Route path="/technologies" element={<TechnologiesPage />} />
        <Route path="/technologies/:id" element={<TechnologyDetailPage />} />
        <Route path="/management-team" element={<ManagementTeamPage />} />

        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/contact" element={<ContactUsPage />} />
        <Route path="/report-search" element={<ReportSearchPage />} />
      </Route>

      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Patient Portal */}
      <Route element={<ProtectedRoute allowedRoles={['PATIENT', 'SUPER_ADMIN', 'ADMIN']} />}>
        <Route element={<PatientLayout />}>
          <Route path="/patient/dashboard" element={<PatientDashboardPage />} />
        </Route>
      </Route>

      {/* Admin Portal Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/departments" element={<DepartmentsPage />} />
          <Route path="/admin/doctors" element={<DoctorsManagementPage />} />
          <Route path="/admin/schedules" element={<DoctorSchedulesPage />} />
          <Route path="/admin/appointments" element={<AppointmentsPage />} />
          <Route path="/admin/tests" element={<TestsManagementPage />} />
          <Route path="/admin/test-categories" element={<TestCategoriesPage />} />
          <Route path="/admin/packages" element={<PackagesManagementPage />} />
          <Route path="/admin/offers" element={<OffersManagementPage />} />
          <Route path="/admin/test-bookings" element={<TestBookingsPage />} />
          <Route path="/admin/reports" element={<ReportsManagementPage />} />
          <Route path="/admin/messages" element={<ContactMessagesPage />} />
          <Route path="/admin/gallery" element={<GalleryManagementPage />} />
          <Route path="/admin/prescriptions/create" element={<DoctorPrescriptionBuilderPage />} />
          <Route path="/admin/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};