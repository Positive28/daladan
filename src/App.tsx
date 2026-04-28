import { Navigate, Route, Routes } from 'react-router-dom'
import { SiteLayout } from './components/layout/SiteLayout'
import { ProtectedRoute } from './components/routing/ProtectedRoute'
import { RedirectProfilePromotionsToAdBoost } from './components/routing/RedirectProfilePromotionsToAdBoost'
import { AdBoostPage } from './pages/AdBoostPage'
import { AdStatsPage } from './pages/AdStatsPage'
import { FavoritesPage } from './pages/FavoritesPage'
import { ItemDetailsPage } from './pages/ItemDetailsPage'
import { AuthPage } from './pages/AuthPage'
import { CreateAdPage } from './pages/CreateAdPage'
import { HomePage } from './pages/HomePage'
import { SearchPage } from './pages/SearchPage'
import { ProfilePage } from './pages/ProfilePage'
import { RefreshPage } from './pages/RefreshPage'
import { AdminAppRoutes } from './routes/AdminAppRoutes'
import { isAdminApp } from './utils/adminHost'
import { LOGIN_PATH, SESSION_REFRESH_PATH } from './utils/appPaths'

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
      <Route path={LOGIN_PATH} element={<AuthPage defaultTab="login" />} />
      <Route path="/register" element={<AuthPage defaultTab="register" />} />
      <Route path={SESSION_REFRESH_PATH} element={<RefreshPage />} />
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
        path="/profile/ads/:ad/stats"
        element={
          <ProtectedRoute>
            <SiteLayout>
              <AdStatsPage />
            </SiteLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/ads/:ad/promotions"
        element={
          <ProtectedRoute>
            <RedirectProfilePromotionsToAdBoost />
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
