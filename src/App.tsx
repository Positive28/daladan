import { Navigate, Route, Routes } from 'react-router-dom'
import { SiteLayout } from './components/layout/SiteLayout'
import { ProtectedRoute } from './components/routing/ProtectedRoute'
import { AdBoostPage } from './pages/AdBoostPage'
import { FavoritesPage } from './pages/FavoritesPage'
import { ItemDetailsPage } from './pages/ItemDetailsPage'
import { LoginPage } from './pages/LoginPage'
import { CreateAdPage } from './pages/CreateAdPage'
import { HomePage } from './pages/HomePage'
import { SearchPage } from './pages/SearchPage'
import { ProfilePage } from './pages/ProfilePage'
import { RegisterPage } from './pages/RegisterPage'
import { AdminAppRoutes } from './routes/AdminAppRoutes'
import { isAdminApp } from './utils/adminHost'

function App() {
  if (isAdminApp()) {
    return <AdminAppRoutes />
  }

  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/item/:id" element={<ItemDetailsPage />} />
      </Route>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/favorites"
        element={
          <ProtectedRoute>
            <SiteLayout>
              <FavoritesPage />
            </SiteLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/ads/new"
        element={
          <ProtectedRoute>
            <SiteLayout>
              <CreateAdPage />
            </SiteLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <SiteLayout>
              <ProfilePage />
            </SiteLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ad-boost/:id"
        element={
          <ProtectedRoute>
            <SiteLayout>
              <AdBoostPage />
            </SiteLayout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
