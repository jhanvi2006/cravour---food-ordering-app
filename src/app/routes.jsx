import { Routes, Route } from 'react-router-dom'

// Layouts
import MainLayout from '@/shared/layouts/MainLayout'
import AuthLayout from '@/shared/layouts/AuthLayout'

// Guards
import ProtectedRoute from '@/shared/components/ProtectedRoute'

// Pages
import HomePage from '@/features/home/pages/HomePage'
import LoginPage from '@/features/auth/pages/LoginPage'
import RegisterPage from '@/features/auth/pages/RegisterPage'
import ExplorePage from '@/features/restaurants/pages/ExplorePage'
import DiscoverPage from '@/features/restaurants/pages/DiscoverPage'
import RestaurantDetailPage from '@/features/restaurants/pages/RestaurantDetailPage'
import CartPage from '@/features/cart/pages/CartPage'
import OrdersPage from '@/features/orders/pages/OrdersPage'
import CheckoutPage from '@/features/orders/pages/CheckoutPage'
import DashboardPage from '@/features/dashboard/pages/DashboardPage'
import ProfilePage from '@/features/profile/pages/ProfilePage'
import OwnerDashboardPage from '@/features/owner/pages/OwnerDashboardPage'
import AdminDashboardPage from '@/features/admin/pages/AdminDashboardPage'
import NotFoundPage from '@/shared/components/NotFoundPage'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes with main nav */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/restaurant/:slug" element={<RestaurantDetailPage />} />
        <Route path="/cart" element={<CartPage />} />

        {/* Protected routes (require login) */}
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['customer']}><DashboardPage /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute allowedRoles={['customer']}><CheckoutPage /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute allowedRoles={['customer']}><OrdersPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

        {/* Owner routes */}
        <Route path="/owner/dashboard" element={<ProtectedRoute allowedRoles={['restaurant_owner']}><OwnerDashboardPage /></ProtectedRoute>} />

        {/* Admin routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboardPage /></ProtectedRoute>} />
      </Route>

      {/* Auth routes (no main nav) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
