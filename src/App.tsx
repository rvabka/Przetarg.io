import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { PageLayout } from './components/layout/PageLayout'
import { HomePage } from './pages/HomePage'
import { FeaturesPage } from './pages/FeaturesPage'
import { SolutionsPage } from './pages/SolutionsPage'
import { PricingPage } from './pages/PricingPage'
import { ResourcesPage } from './pages/ResourcesPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PageLayout />}>
          <Route index element={<HomePage />} />
          <Route path="funkcje" element={<FeaturesPage />} />
          <Route path="rozwiazania" element={<SolutionsPage />} />
          <Route path="cennik" element={<PricingPage />} />
          <Route path="zasoby" element={<ResourcesPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
