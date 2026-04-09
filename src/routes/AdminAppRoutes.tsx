import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from '../components/admin/AdminLayout'
import { ProtectedRoute } from '../components/routing/ProtectedRoute'
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage'
import { AdminCategoriesPage } from '../pages/admin/AdminCategoriesPage'
import { AdminSubcategoriesPage } from '../pages/admin/AdminSubcategoriesPage'
import { AdminUserAdDetailPage } from '../pages/admin/AdminUserAdDetailPage'
import { AdminUserDetailPage } from '../pages/admin/AdminUserDetailPage'
import { AdminUsersPage } from '../pages/admin/AdminUsersPage'
import { LoginPage } from '../pages/LoginPage'

export const AdminAppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage variant="admin" />} />
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="subcategories" element={<AdminSubcategoriesPage />} />
        <Route path="users/:userId/ads/:adId" element={<AdminUserAdDetailPage />} />
        <Route path="users/:userId" element={<AdminUserDetailPage />} />
        <Route path="users" element={<AdminUsersPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
