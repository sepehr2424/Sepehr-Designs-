import { InputField, TextareaField } from '../ui/Field'

export interface BookingFormData {
  fullName: string
  email: string
  phone: string
  notes: string
}

interface DetailsStepProps {
  data: BookingFormData
  onChange: (data: BookingFormData) => void
  errors: Partial<Record<keyof BookingFormData, string>>
}

export function DetailsStep({ data, onChange, errors }: DetailsStepProps) {
  const update = (field: keyof BookingFormData, value: string) => onChange({ ...data, [field]: value })

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <InputField
        label="Full name"
        id="fullName"
        placeholder="Jordan Lee"
        value={data.fullName}
        onChange={(e) => update('fullName', e.target.value)}
        error={errors.fullName}
        autoComplete="name"
      />
      <InputField
        label="Phone number"
        id="phone"
        type="tel"
        placeholder="+1 (555) 123-4567"
        value={data.phone}
        onChange={(e) => update('phone', e.target.value)}
        error={errors.phone}
        autoComplete="tel"
      />
      <div className="sm:col-span-2">
        <InputField
          label="Email address"
          id="email"
          type="email"
          placeholder="jordan@example.com"
          value={data.email}
          onChange={(e) => update('email', e.target.value)}
          error={errors.email}
          autoComplete="email"
        />
      </div>
      <div className="sm:col-span-2">
        <TextareaField
          label="Notes (optional)"
          id="notes"
          rows={4}
          placeholder="Anything the viewing coordinator should know — parking, accessibility, questions about the property…"
          value={data.notes}
          onChange={(e) => update('notes', e.target.value)}
        />
      </div>
    </div>
  )
}
