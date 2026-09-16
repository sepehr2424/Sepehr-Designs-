<?php
// Configuration for the booking system and admin dashboard.
//
// This file is executed by PHP, so its contents are never sent to a visitor's
// browser. The .htaccess file additionally denies direct access to it.
// Never move these values into any .js or .html file.

// ---------------------------------------------------------------------------
// Database (created on Hostinger — change the password in hPanel any time,
// then update it here)
// ---------------------------------------------------------------------------
const DB_HOST = 'localhost';
const DB_NAME = 'your_database_name';
const DB_USER = 'your_database_user';
const DB_PASS = 'your_database_password';

// ---------------------------------------------------------------------------
// Booking rules
// ---------------------------------------------------------------------------
const TIME_ZONE = 'Europe/Stockholm';
const BOOKING_WINDOW_DAYS = 30;
const SLOTS = ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

// ---------------------------------------------------------------------------
// Email notifications
// ---------------------------------------------------------------------------
// Where booking notifications are sent.
const NOTIFY_EMAIL = 'sepehrrajaiyan@gmail.com';

// Paste your Resend API key here to switch notification emails on.
// Leave it empty and bookings still work perfectly — you just won't get an
// email until a key is set.
const RESEND_API_KEY = '';
const RESEND_FROM = 'Bookings <onboarding@resend.dev>';

// ---------------------------------------------------------------------------
// Admin dashboard
// ---------------------------------------------------------------------------
// One-time token used only to set your admin password the first time.
// Visit:  /admin/?setup=<this token>
// After the password is set, this token stops working entirely.
const ADMIN_SETUP_TOKEN = 'generate-a-long-random-string-here';
