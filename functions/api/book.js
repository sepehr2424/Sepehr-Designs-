import {
  isValidDate,
  isValidSlot,
  isValidEmail,
  computeAvailableSlots,
  jsonResponse,
  supabaseRequest,
} from "../_utils.js";

const NOTIFY_EMAIL = "sepehrrajaiyan@gmail.com";

// POST /api/book  { date, time, name, email, message }
// Creates a booking. The database's UNIQUE(date, start_time) constraint is
// the source of truth for preventing double-bookings — this still checks the
// slot looks plausible first, but the constraint is what actually protects
// against a race between two people booking the same slot at once.
export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch (err) {
    return jsonResponse({ error: "invalid_body" }, 400);
  }

  const date = body && body.date;
  const time = body && body.time;
  const name = body && typeof body.name === "string" ? body.name.trim() : "";
  const email = body && typeof body.email === "string" ? body.email.trim() : "";
  const message = body && typeof body.message === "string" ? body.message.trim() : "";

  if (!isValidDate(date) || !isValidSlot(time)) {
    return jsonResponse({ error: "invalid_slot" }, 400);
  }
  if (!name || !isValidEmail(email)) {
    return jsonResponse({ error: "missing_fields" }, 400);
  }

  // Re-derive "is this slot even theoretically bookable" ignoring existing
  // reservations, to reject stale/tampered dates and times server-side.
  const theoreticallyOpen = computeAvailableSlots(date, new Set());
  if (!theoreticallyOpen.includes(time)) {
    return jsonResponse({ error: "slot_unavailable" }, 400);
  }

  let insertRes;
  try {
    insertRes = await supabaseRequest(env, "bookings", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify([
        {
          date,
          start_time: time,
          name,
          email,
          message: message || null,
        },
      ]),
    });
  } catch (err) {
    return jsonResponse({ error: "server_error" }, 500);
  }

  if (insertRes.status === 409) {
    return jsonResponse({ error: "slot_taken" }, 409);
  }

  if (!insertRes.ok) {
    return jsonResponse({ error: "server_error" }, 500);
  }

  // Email failure should not undo a successful booking, but is worth
  // reporting distinctly so it's visible in logs.
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Bookings <onboarding@resend.dev>",
        to: [NOTIFY_EMAIL],
        subject: `New booking: ${name} — ${date} ${time}`,
        text: [
          "New booking received.",
          "",
          `Name: ${name}`,
          `Email: ${email}`,
          `Date: ${date}`,
          `Time: ${time} (Europe/Stockholm)`,
          `Message: ${message || "—"}`,
        ].join("\n"),
      }),
    });
  } catch (err) {
    console.error("Resend notification failed:", err);
  }

  return jsonResponse({ ok: true });
}
