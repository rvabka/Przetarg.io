import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { PageLayout } from './components/layout/PageLayout'
import { HomePage } from './pages/HomePage'
import { FeaturesPage } from './pages/FeaturesPage'
import { SolutionsPage } from './pages/SolutionsPage'
import { PricingPage } from './pages/PricingPage'
import { ResourcesPage } from './pages/ResourcesPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { VerifyEmailPage } from './pages/VerifyEmailPage'
import { DashboardPage } from './pages/DashboardPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Auth Routes */}
          <Route path="/zaloguj" element={<LoginPage />} />
          <Route path="/zarejestruj" element={<RegisterPage />} />
          <Route path="/potwierdz-email" element={<VerifyEmailPage />} />

          {/* Main Routes */}
          <Route path="/" element={<PageLayout />}>
            <Route index element={<HomePage />} />
            <Route path="dashboard" element={<DashboardPage />} />
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
