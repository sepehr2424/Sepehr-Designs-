import { useEffect, useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { InputField, TextareaField } from '../ui/Field'
import type { Service } from '../../lib/database.types'
import type { ServiceInput } from '../../hooks/useAdminServices'

interface ServiceFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (input: ServiceInput) => Promise<{ error: string | null }>
  service: Service | null
}

const EMPTY: ServiceInput = { name: '', description: '', duration_minutes: 30, price: 0, is_active: true }

export function ServiceFormModal({ open, onClose, onSubmit, service }: ServiceFormModalProps) {
  const [form, setForm] = useState<ServiceInput>(EMPTY)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(
        service
          ? {
              name: service.name,
              description: service.description ?? '',
              duration_minutes: service.duration_minutes,
              price: service.price,
              is_active: service.is_active,
            }
          : EMPTY
      )
      setError(null)
    }
  }, [open, service])

  async function handleSubmit() {
    if (!form.name.trim()) {
      setError('Please enter a name for this viewing type.')
      return
    }
    setSaving(true)
    const { error } = await onSubmit({ ...form, name: form.name.trim(), description: form.description.trim() })
    setSaving(false)
    if (error) {
      setError(error)
      return
    }
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={service ? 'Edit viewing type' : 'Add viewing type'}
      description="This appears to clients on the public booking page."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={saving}>
            {service ? 'Save changes' : 'Add viewing type'}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <InputField
          label="Name"
          id="service-name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Apartment Viewing"
        />
        <TextareaField
          label="Description"
          id="service-description"
          rows={3}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="What a client can expect from this viewing appointment."
        />
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Duration (minutes)"
            id="service-duration"
            type="number"
            min={5}
            step={5}
            value={form.duration_minutes}
            onChange={(e) => setForm((f) => ({ ...f, duration_minutes: Number(e.target.value) }))}
          />
          <InputField
            label="Price (USD)"
            id="service-price"
            type="number"
            min={0}
            step={1}
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
          />
        </div>
        <label className="flex items-center gap-2.5 text-sm font-medium text-charcoal">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
            className="h-4 w-4 rounded border-stone-300 text-navy focus:ring-navy/30"
          />
          Active — visible on the public booking page
        </label>

        {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      </div>
    </Modal>
  )
}
