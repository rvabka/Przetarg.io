import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { AuthGuard } from './components/guards/AuthGuard'
import { PageLayout } from './components/layout/PageLayout'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { HomePage } from './pages/HomePage'
import { FeaturesPage } from './pages/FeaturesPage'
import { SolutionsPage } from './pages/SolutionsPage'
import { PricingPage } from './pages/PricingPage'
import { ResourcesPage } from './pages/ResourcesPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { VerifyEmailPage } from './pages/VerifyEmailPage'
import { MyTendersPage } from './pages/dashboard/MyTendersPage'
import { GlobalSearchPage } from './pages/dashboard/GlobalSearchPage'
import { NotificationsPage } from './pages/dashboard/NotificationsPage'
import { CpvSearchPage } from './pages/dashboard/CpvSearchPage'
import { CompanyProfilePage } from './pages/dashboard/CompanyProfilePage'
import { SettingsPage } from './pages/dashboard/SettingsPage'
import { OnboardingPage } from './pages/dashboard/OnboardingPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Auth Routes */}
          <Route path="/zaloguj" element={<LoginPage />} />
          <Route path="/zarejestruj" element={<RegisterPage />} />
          <Route path="/potwierdz-email" element={<VerifyEmailPage />} />

          {/* Dashboard Routes (protected) */}
          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <DashboardLayout />
              </AuthGuard>
            }
          >
            <Route index element={<MyTendersPage />} />
            <Route path="szukaj" element={<GlobalSearchPage />} />
            <Route path="powiadomienia" element={<NotificationsPage />} />
            <Route path="cpv" element={<CpvSearchPage />} />
            <Route path="firma" element={<CompanyProfilePage />} />
            <Route path="ustawienia" element={<SettingsPage />} />
            <Route path="onboarding" element={<OnboardingPage />} />
          </Route>

          {/* Landing / Public Routes */}
          <Route path="/" element={<PageLayout />}>
            <Route index element={<HomePage />} />
            <Route path="funkcje" element={<FeaturesPage />} />
            <Route path="rozwiazania" element={<SolutionsPage />} />
            <Route path="cennik" element={<PricingPage />} />
            <Route path="zasoby" element={<ResourcesPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
