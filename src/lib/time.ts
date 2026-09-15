import { addMinutes, format, isValid, set } from 'date-fns'

/** Combine a calendar date with a "HH:mm" or "HH:mm:ss" time string into one Date. */
export function combineDateAndTime(date: Date, time: string): Date {
  const [hoursStr, minutesStr, secondsStr] = time.split(':')
  const hours = Number(hoursStr)
  const minutes = Number(minutesStr ?? 0)
  const seconds = Number(secondsStr ?? 0)

  const combined = set(date, {
    hours: Number.isFinite(hours) ? hours : 0,
    minutes: Number.isFinite(minutes) ? minutes : 0,
    seconds: Number.isFinite(seconds) ? seconds : 0,
    milliseconds: 0,
  })

  return isValid(combined) ? combined : new Date(NaN)
}

/** yyyy-MM-dd, safe for Postgres `date` columns. */
export function toDateInput(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

/** HH:mm:ss, safe for Postgres `time` columns. */
export function toTimeInput(date: Date): string {
  return format(date, 'HH:mm:ss')
}

/** e.g. "9:30 AM" */
export function toTimeLabel(date: Date): string {
  return format(date, 'h:mm a')
}

export function toDayLabel(date: Date): string {
  return format(date, 'EEEE, MMMM d, yyyy')
}

export { addMinutes }
