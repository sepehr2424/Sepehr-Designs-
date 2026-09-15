import { useEffect, useState } from 'react'
import { AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '../ui/Button'
import { Img } from '../ui/Img'
import { SectionHeading } from '../ui/SectionHeading'
import { StepIndicator } from './StepIndicator'
import { ServiceStep } from './ServiceStep'
import { DateTimeStep } from './DateTimeStep'
import { DetailsStep, type BookingFormData } from './DetailsStep'
import { SummaryCard } from './SummaryCard'
import { SuccessStep } from './SuccessStep'
import { useBookingAvailability } from '../../hooks/useBookingAvailability'
import { supabase } from '../../lib/supabase'
import { images } from '../../lib/images'
import { toDateInput, toTimeInput } from '../../lib/time'
import type { Service, BusinessSettings } from '../../lib/database.types'
import type { TimeSlot } from '../../lib/availability'

const EMPTY_FORM: BookingFormData = { fullName: '', email: '', phone: '', notes: '' }
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface BookingSectionProps {
  services: Service[]
  loadingServices: boolean
  settings: BusinessSettings
  preselectedService: Service | null
}

export function BookingSection({ services, loadingServices, settings, preselectedService }: BookingSectionProps) {
  const [step, setStep] = useState(1)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [form, setForm] = useState<BookingFormData>(EMPTY_FORM)
  const [errors, setErrors] = useState<Partial<Record<keyof BookingFormData, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { closedWeekdays, blockedDateSet, loadSlotsForDate } = useBookingAvailability(settings)

  useEffect(() => {
    if (preselectedService) {
      setSelectedService(preselectedService)
      setStep(1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselectedService?.id])

  const goToStep = (target: number) => {
    setStep(target)
    document.querySelector('#booking')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function validateDetails(): boolean {
    const next: Partial<Record<keyof BookingFormData, string>> = {}
    if (!form.fullName.trim()) next.fullName = 'Please enter your full name.'
    if (!EMAIL_RE.test(form.email.trim())) next.email = 'Please enter a valid email address.'
    if (form.phone.trim().length < 6) next.phone = 'Please enter a valid phone number.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit() {
    if (!selectedService || !selectedDate || !selectedSlot) return
    if (!validateDetails()) return

    setSubmitting(true)
    setSubmitError(null)

    const { error } = await supabase.from('appointments').insert({
      full_name: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      service_id: selectedService.id,
      appointment_date: toDateInput(selectedDate),
      start_time: toTimeInput(selectedSlot.start),
      end_time: toTimeInput(selectedSlot.end),
      notes: form.notes.trim() || null,
    })

    setSubmitting(false)

    if (error) {
      setSubmitError('We could not submit your request. Please try again in a moment.')
      return
    }

    setStep(4)
  }

  function resetBooking() {
    setStep(1)
    setSelectedService(null)
    setSelectedDate(null)
    setSelectedSlot(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setSubmitError(null)
  }

  return (
    <section id="booking" className="relative bg-navy-dark py-28">
      <div className="absolute inset-0 opacity-[0.15]">
        <Img src={images.bookingAccent.src} alt={images.bookingAccent.alt} className="h-full w-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-navy-dark via-navy-dark to-navy-dark/95" />

      <div className="container-premium relative z-10">
        <SectionHeading
          eyebrow="Book a Viewing"
          tone="dark"
          align="center"
          title="Reserve your property viewing appointment"
          description="Four quick steps: choose a viewing type, pick a date and time, share your details, and you're confirmed."
        />

        <div className="mx-auto mt-14 max-w-4xl rounded-[2rem] bg-cream p-6 shadow-premium sm:p-10">
          {step < 4 && (
            <div className="mb-10">
              <StepIndicator currentStep={step} />
            </div>
          )}

          {step === 1 && (
            <div className="animate-fade-in">
              <ServiceStep
                services={services}
                loading={loadingServices}
                selected={selectedService}
                onSelect={setSelectedService}
              />
              <div className="mt-8 flex justify-end">
                <Button disabled={!selectedService} onClick={() => goToStep(2)} icon={<ArrowRight size={16} />}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 2 && selectedService && (
            <div className="animate-fade-in">
              <DateTimeStep
                service={selectedService}
                selectedDate={selectedDate}
                selectedSlot={selectedSlot}
                onDateChange={(date) => {
                  setSelectedDate(date)
                  setSelectedSlot(null)
                }}
                onSlotChange={setSelectedSlot}
                closedWeekdays={closedWeekdays}
                blockedDateSet={blockedDateSet}
                loadSlotsForDate={loadSlotsForDate}
              />
              <div className="mt-8 flex justify-between">
                <Button variant="ghost" onClick={() => goToStep(1)} icon={<ArrowLeft size={16} />} iconPosition="left">
                  Back
                </Button>
                <Button disabled={!selectedDate || !selectedSlot} onClick={() => goToStep(3)} icon={<ArrowRight size={16} />}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 3 && selectedService && selectedDate && selectedSlot && (
            <div className="animate-fade-in grid gap-8 lg:grid-cols-[1.3fr_1fr]">
              <div>
                <DetailsStep data={form} onChange={setForm} errors={errors} />

                {submitError && (
                  <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    {submitError}
                  </div>
                )}

                <div className="mt-8 flex justify-between">
                  <Button variant="ghost" onClick={() => goToStep(2)} icon={<ArrowLeft size={16} />} iconPosition="left">
                    Back
                  </Button>
                  <Button onClick={handleSubmit} loading={submitting}>
                    Confirm viewing request
                  </Button>
                </div>
              </div>
              <div>
                <SummaryCard service={selectedService} date={selectedDate} slot={selectedSlot} />
              </div>
            </div>
          )}

          {step === 4 && selectedService && selectedDate && selectedSlot && (
            <div className="animate-fade-in">
              <SuccessStep
                service={selectedService}
                date={selectedDate}
                slot={selectedSlot}
                form={form}
                onBookAnother={resetBooking}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
