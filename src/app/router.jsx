import { Route, Routes } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import EmptyState from '../components/ui/EmptyState';
import HomePage from '../pages/HomePage';
import ServicesPage from '../pages/ServicesPage';
import CategoriesPage from '../pages/CategoriesPage';
import SearchResultsPage from '../pages/SearchResultsPage';
import ServiceDetailsPage from '../pages/ServiceDetailsPage';
import ServiceRequestPage from '../pages/ServiceRequestPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import MyRequestsPage from '../pages/MyRequestsPage';
import StudentProfilePage from '../pages/StudentProfilePage';

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="search" element={<SearchResultsPage />} />
        <Route path="services/:serviceId" element={<ServiceDetailsPage />} />
        <Route path="request/:serviceId" element={<ServiceRequestPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="my-requests" element={<MyRequestsPage />} />
        <Route path="students/:studentId" element={<StudentProfilePage />} />
        <Route path="*" element={<main className="container page-section"><EmptyState title="الصفحة غير موجودة" description="الرابط ده مش موجود. ارجع لقائمة الخدمات واختار اللي يناسبك." actionLabel="تصفّح الخدمات" actionTo="/services" /></main>} />
      </Route>
    </Routes>
  );
}
