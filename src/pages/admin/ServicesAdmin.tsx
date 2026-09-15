import { useState } from 'react'
import { Building2, Pencil, Plus, PowerOff, Power } from 'lucide-react'
import { PageHeader } from '../../components/admin/PageHeader'
import { Card } from '../../components/admin/Card'
import { EmptyState } from '../../components/admin/EmptyState'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { ServiceFormModal } from '../../components/admin/ServiceFormModal'
import { useAdminServices } from '../../hooks/useAdminServices'
import type { Service } from '../../lib/database.types'

function formatPrice(price: number) {
  if (!price || price <= 0) return 'Complimentary'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)
}

export function ServicesAdmin() {
  const { services, loading, createService, updateService, toggleActive } = useAdminServices()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  function openCreate() {
    setEditingService(null)
    setModalOpen(true)
  }

  function openEdit(service: Service) {
    setEditingService(service)
    setModalOpen(true)
  }

  async function handleToggle(service: Service) {
    setTogglingId(service.id)
    await toggleActive(service.id, !service.is_active)
    setTogglingId(null)
  }

  return (
    <div>
      <PageHeader
        title="Services"
        description="Manage the property viewing types clients can book."
        action={
          <Button icon={<Plus size={16} />} onClick={openCreate}>
            Add viewing type
          </Button>
        }
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-stone-100" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <EmptyState icon={Building2} title="No viewing types yet" description="Add your first property viewing type to start accepting bookings." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {services.map((service) => (
            <Card key={service.id} className="flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-base font-medium text-charcoal">{service.name}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-graphite">{service.description}</p>
                </div>
                <Badge tone={service.is_active ? 'emerald' : 'stone'}>{service.is_active ? 'Active' : 'Inactive'}</Badge>
              </div>

              <div className="mt-4 flex items-center gap-4 text-sm font-medium text-graphite">
                <span>{service.duration_minutes} min</span>
                <span className="text-navy">{formatPrice(service.price)}</span>
              </div>

              <div className="mt-5 flex items-center gap-2 border-t border-stone-100 pt-4">
                <Button size="sm" variant="ghost" icon={<Pencil size={14} />} iconPosition="left" onClick={() => openEdit(service)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  icon={service.is_active ? <PowerOff size={14} /> : <Power size={14} />}
                  iconPosition="left"
                  loading={togglingId === service.id}
                  onClick={() => handleToggle(service)}
                >
                  {service.is_active ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ServiceFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        service={editingService}
        onSubmit={(input) => (editingService ? updateService(editingService.id, input) : createService(input))}
      />
    </div>
  )
}
