import { isValidDate, computeAvailableSlots, jsonResponse, supabaseRequest } from "../_utils.js";

// GET /api/availability?date=YYYY-MM-DD
// Returns { slots: ["12:00", "14:00", ...] } — the still-bookable times for
// that date, with already-booked and past times already removed.
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date");

  if (!isValidDate(date)) {
    return jsonResponse({ error: "invalid_date" }, 400);
  }

  let taken;
  try {
    const res = await supabaseRequest(
      env,
      `bookings?date=eq.${encodeURIComponent(date)}&select=start_time`
    );
    if (!res.ok) throw new Error("supabase_error");
    const rows = await res.json();
    taken = new Set(rows.map((r) => String(r.start_time).slice(0, 5)));
  } catch (err) {
    return jsonResponse({ error: "server_error" }, 500);
  }

  const slots = computeAvailableSlots(date, taken);
  return jsonResponse({ slots });
}
