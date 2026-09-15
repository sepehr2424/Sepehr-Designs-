import { Route, Routes } from 'react-router-dom'
import { PublicHome } from './pages/PublicHome'
import { AdminAuthProvider } from './context/AdminAuthProvider'
import { AdminGate } from './pages/admin/AdminGate'
import { AdminLayout } from './pages/admin/AdminLayout'
import { Overview } from './pages/admin/Overview'
import { Appointments } from './pages/admin/Appointments'
import { ServicesAdmin } from './pages/admin/ServicesAdmin'
import { BusinessHoursAdmin } from './pages/admin/BusinessHoursAdmin'
import { BlockedDatesAdmin } from './pages/admin/BlockedDatesAdmin'
import { BusinessSettingsAdmin } from './pages/admin/BusinessSettingsAdmin'

function AdminApp() {
  return (
    <AdminAuthProvider>
      <AdminGate>
        <Routes>
          <Route element={<AdminLayout />}>
            <Route index element={<Overview />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="services" element={<ServicesAdmin />} />
            <Route path="business-hours" element={<BusinessHoursAdmin />} />
            <Route path="blocked-dates" element={<BlockedDatesAdmin />} />
            <Route path="settings" element={<BusinessSettingsAdmin />} />
          </Route>
        </Routes>
      </AdminGate>
    </AdminAuthProvider>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicHome />} />
      <Route path="/admin/*" element={<AdminApp />} />
    </Routes>
  )
}

export default App
