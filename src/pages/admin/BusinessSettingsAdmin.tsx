import { useEffect, useState, type FormEvent } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { PageHeader } from '../../components/admin/PageHeader'
import { Card } from '../../components/admin/Card'
import { Button } from '../../components/ui/Button'
import { InputField, TextareaField } from '../../components/ui/Field'
import { useAdminBusinessSettings } from '../../hooks/useAdminBusinessSettings'

export function BusinessSettingsAdmin() {
  const { settings, loading, save } = useAdminBusinessSettings()
  const [form, setForm] = useState({
    business_name: '',
    business_email: '',
    business_phone: '',
    business_address: '',
    slot_interval_minutes: 30,
    booking_notice_hours: 4,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (settings) {
      setForm({
        business_name: settings.business_name,
        business_email: settings.business_email,
        business_phone: settings.business_phone,
        business_address: settings.business_address,
        slot_interval_minutes: settings.slot_interval_minutes,
        booking_notice_hours: settings.booking_notice_hours,
      })
    }
  }, [settings])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)
    const { error } = await save(form)
    setSaving(false)
    if (error) {
      setError(error)
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Business Settings" />
        <div className="h-96 animate-pulse rounded-2xl bg-stone-100" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Business Settings" description="These details appear on the public website and drive booking rules." />

      <Card className="max-w-2xl p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <InputField
            label="Business Name"
            id="business_name"
            value={form.business_name}
            onChange={(e) => setForm((f) => ({ ...f, business_name: e.target.value }))}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <InputField
              label="Business Email"
              id="business_email"
              type="email"
              value={form.business_email}
              onChange={(e) => setForm((f) => ({ ...f, business_email: e.target.value }))}
            />
            <InputField
              label="Business Phone"
              id="business_phone"
              value={form.business_phone}
              onChange={(e) => setForm((f) => ({ ...f, business_phone: e.target.value }))}
            />
          </div>
          <TextareaField
            label="Business Address"
            id="business_address"
            rows={2}
            value={form.business_address}
            onChange={(e) => setForm((f) => ({ ...f, business_address: e.target.value }))}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <InputField
              label="Slot Interval (minutes)"
              id="slot_interval_minutes"
              type="number"
              min={5}
              step={5}
              hint="Spacing between available viewing time slots."
              value={form.slot_interval_minutes}
              onChange={(e) => setForm((f) => ({ ...f, slot_interval_minutes: Number(e.target.value) }))}
            />
            <InputField
              label="Booking Notice (hours)"
              id="booking_notice_hours"
              type="number"
              min={0}
              step={1}
              hint="Minimum notice required before a viewing can be booked."
              value={form.booking_notice_hours}
              onChange={(e) => setForm((f) => ({ ...f, booking_notice_hours: Number(e.target.value) }))}
            />
          </div>

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <div className="flex items-center gap-3 border-t border-stone-100 pt-5">
            <Button type="submit" loading={saving}>
              Save settings
            </Button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-emerald">
                <CheckCircle2 size={16} /> Saved
              </span>
            )}
          </div>
        </form>
      </Card>
    </div>
  )
}
