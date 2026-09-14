// Shared helpers for the booking API. Files prefixed with "_" are not
// routable by Cloudflare Pages Functions — this is a plain shared module.

export const TIME_ZONE = "Europe/Stockholm";
export const BOOKING_WINDOW_DAYS = 30;
export const MEETING_DURATION_MINUTES = 60;

// Bookable window is 12:00–18:00 Europe/Stockholm, every day, 60-minute slots.
export const ALL_SLOTS = ["12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDate(value) {
  return typeof value === "string" && DATE_RE.test(value);
}

export function isValidSlot(value) {
  return ALL_SLOTS.includes(value);
}

export function isValidEmail(value) {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// Returns { today: "YYYY-MM-DD", maxDate: "YYYY-MM-DD", nowHM: "HH:MM" } all
// computed in Europe/Stockholm local time, without needing a date library.
export function getStockholmWindow() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  const today = `${map.year}-${map.month}-${map.day}`;
  const nowHM = `${map.hour}:${map.minute}`;

  const [y, m, d] = today.split("-").map(Number);
  const maxDateObj = new Date(Date.UTC(y, m - 1, d));
  maxDateObj.setUTCDate(maxDateObj.getUTCDate() + BOOKING_WINDOW_DAYS);
  const maxDate = maxDateObj.toISOString().slice(0, 10);

  return { today, maxDate, nowHM };
}

// Given a date string, returns the slots that are still bookable: excludes
// times already in `takenTimes`, excludes past times if date is today, and
// excludes the date entirely if it's in the past or beyond the window.
export function computeAvailableSlots(date, takenTimes) {
  const { today, maxDate, nowHM } = getStockholmWindow();

  if (date < today || date > maxDate) return [];

  let slots = ALL_SLOTS.filter((t) => !takenTimes.has(t));

  if (date === today) {
    slots = slots.filter((t) => t > nowHM);
  }

  return slots;
}

export function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// Minimal Supabase REST helper. Uses the service role key, which must only
// ever be read from an environment binding — never hardcoded, never sent to
// the browser.
export async function supabaseRequest(env, path, options = {}) {
  const url = `${env.SUPABASE_URL}/rest/v1/${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  return res;
}
