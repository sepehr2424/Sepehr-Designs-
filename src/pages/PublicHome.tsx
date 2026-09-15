import { useState } from 'react'
import { Navbar } from '../components/public/Navbar'
import { Hero } from '../components/public/Hero'
import { Services } from '../components/public/Services'
import { About } from '../components/public/About'
import { BookingSection } from '../components/booking/BookingSection'
import { Footer } from '../components/public/Footer'
import { useActiveServices } from '../hooks/useActiveServices'
import { useBusinessSettings } from '../hooks/useBusinessSettings'
import type { Service } from '../lib/database.types'

export function PublicHome() {
  const { services, loading: loadingServices } = useActiveServices()
  const { settings } = useBusinessSettings()
  const [preselectedService, setPreselectedService] = useState<Service | null>(null)

  const handleServiceSelect = (service: Service) => {
    setPreselectedService(service)
    document.querySelector('#booking')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar settings={settings} />
      <main>
        <Hero />
        <Services services={services} loading={loadingServices} onSelect={handleServiceSelect} />
        <About />
        <BookingSection
          services={services}
          loadingServices={loadingServices}
          settings={settings}
          preselectedService={preselectedService}
        />
      </main>
      <Footer settings={settings} />
    </div>
  )
}
