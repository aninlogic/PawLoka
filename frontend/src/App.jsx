import { Route, Routes } from 'react-router-dom'
import { SiteLayout } from './components/SiteLayout'
import { HomePage } from './pages/HomePage'
import { PetCatalogPage } from './pages/PetCatalogPage'
import { PetDetailPage } from './pages/PetDetailPage'
import { FavoritePage } from './pages/FavoritePage'
import { ShelterDirectoryPage } from './pages/ShelterDirectoryPage'
import { ShelterDetailPage } from './pages/ShelterDetailPage'
import { AdoptionGuidePage } from './pages/AdoptionGuidePage'
import { ApplicationsPage } from './pages/ApplicationsPage'
import { AboutPage } from './pages/AboutPage'
import { ApplicationPage } from './pages/ApplicationPage'
import { AdminLoginPage } from './pages/AdminLoginPage'
import { AdminPage } from './pages/AdminPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="pets" element={<PetCatalogPage />} />
        <Route path="pets/:id" element={<PetDetailPage />} />
        <Route path="favorites" element={<FavoritePage />} />
        <Route path="shelters" element={<ShelterDirectoryPage />} />
        <Route path="shelters/:id" element={<ShelterDetailPage />} />
        <Route path="adoption" element={<AdoptionGuidePage />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="apply/:petId" element={<ApplicationPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="admin/login" element={<AdminLoginPage />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="*" element={<AboutPage notFound />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes