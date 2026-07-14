# Qarmo — Technical Requirements

> Derived from [[Project Requirements]]. Covers the technical architecture and implementation requirements for the MVP.

## 1. Architecture Overview

| Layer | Decision |
|---|---|
| Mobile apps | **React Native with Expo**, all apps in a **single monorepo** |
| Backend | **Supabase** (Auth, Postgres, Realtime, Storage, Edge Functions) |
| Maps & GPS | **Ola Maps / MapmyIndia** (places, routing, tracking) |
| KYC verification | **Third-party provider, kept pluggable** (not yet selected) |
| Payments (Phase 1) | **Cash only** — no gateway integration |
| Push notifications | **Expo Push Notifications** |

**Guiding constraint:** this is an MVP. No custom backend server — Supabase is the backend. Server-side business logic that can't safely run on the client lives in **Supabase Edge Functions**; everything else goes through the Supabase client SDK guarded by **Row Level Security (RLS)**.

---

## 2. Monorepo & Frontend

- **TR-1:** Single monorepo containing all apps and shared packages, managed with workspaces pnpm and a task runner Turborepo.
- **TR-2:** Apps in the monorepo:
  - `apps/partner` — **Driver / Delivery Executive app** (Phase 1 deliverable). One app, role-based experience after login.
  - `apps/customer` — Customer app (built after partner app; backend supports it from day one).
  - `apps/restaurant` — Restaurant owner app (later phase).
- **TR-3:** Shared packages:
  - `packages/ui` — shared design system / components.
  - `packages/supabase` — typed Supabase client, generated DB types, auth helpers.
  - `packages/core` — shared business types, constants (vehicle types, ride statuses), utilities.
- **TR-4:** Expo SDK with **EAS Build** for store builds and **EAS Update** for OTA JS updates.
- **TR-5:** Location capture in the partner app via `expo-location`, including **background location** while the driver is online (Android foreground-service notification required).

---

## 3. Backend (Supabase)

### 3.1 Authentication

- **TR-6:** **Phone OTP** sign-up/login via Supabase Auth (supports FR-1, FR-2). Immediate access after OTP — no verification gate at sign-up (FR-4a).
- **TR-7:** Every auth user gets a `profiles` row (trigger on `auth.users` insert) holding role(s), referral code, and verification status.
- **TR-8:** A user can hold multiple roles (auto driver + delivery executive — BR-5). Role selection at onboarding; stored as an array/flags, not a single enum.

### 3.2 Database (Postgres)

- **TR-9:** Core tables (indicative):
  - `profiles` — user identity, roles, referral code, `verification_status` (`unverified` → `pending_review` → `verified` / `rejected`).
  - `referrals` — referrer ↔ referred pairs, points awarded, timestamps (FR-5–FR-8).
  - `driver_documents` — document type, storage path, review status (FR-4b).
  - `vehicles` — vehicle per driver with `vehicle_type` enum (`auto`, `bike`, `cab`) so later phases need no schema change (BR-5).
  - `pricing_rules` — per-km / base rates per vehicle type and area (BR-2).
  - `ride_requests` — pickup/drop coordinates + addresses, computed base price, status, `expires_at` (FR-10, FR-11, FR-16a).
  - `bids` — driver offers against a request: amount, status (FR-12–FR-15).
  - `rides` — confirmed rides: chosen driver, final fare, lifecycle status, `payment_method = 'cash'`.
- **TR-10:** **RLS on every table.** Examples: drivers see only open requests and their own bids; customers see only bids on their own requests; unverified drivers are blocked (by policy) from creating bids or going online (BR-7).
- **TR-11:** Geospatial columns via **PostGIS** (`geography(Point)`) for pickup/drop/driver locations, enabling nearby-request queries later.

### 3.3 Edge Functions (server-side logic)

- **TR-12:** `award-referral-points` — validates the referral code at sign-up and credits the referrer atomically (FR-5, BR-1). Never done client-side.
- **TR-13:** `accept-bid` — customer's bid selection runs atomically: confirm one bid, reject siblings, create the `rides` row, close the request (FR-16, BR-4).
- **TR-14:** `compute-base-price` — takes pickup/drop, calls the maps Distance API, applies `pricing_rules`, returns and stores the base price (FR-11, BR-2).
- **TR-15:** Request expiry — `pg_cron` (or scheduled Edge Function) marks `ride_requests` past `expires_at` as expired; window configurable, default **3 minutes** (FR-16a, BR-8).

### 3.4 Realtime (bidding flow)

- **TR-16:** **Supabase Realtime** powers the bidding loop:
  - Drivers subscribe to open `ride_requests` (filtered by area/vehicle type).
  - The requesting customer subscribes to `bids` for their request — offers appear live (FR-15).
  - Both sides receive status changes (confirmed / expired) instantly.
- **TR-17:** Driver live location during an active ride is published over a Realtime channel (ephemeral; not persisted every tick — persist at a coarse interval only).

### 3.5 Storage

- **TR-18:** Supabase Storage buckets: `kyc-documents` (private, RLS: owner + admin only) and `avatars` (public read).

---

## 4. Maps & Location (Ola Maps / MapmyIndia)

- **TR-19:** Provider APIs used:
  - **Places / autocomplete** — pickup & destination search (FR-10).
  - **Directions / Distance Matrix** — distance & duration for base-price computation (FR-11) and ETAs.
  - **Map SDK / tiles** — map display and live tracking in both apps.
- **TR-20:** Wrap the provider behind a small internal `maps` package interface (geocode, autocomplete, route, distance) so the provider can be swapped without touching app code.
- **TR-21:** API keys live server-side (Edge Functions) wherever the provider allows; never ship unrestricted keys in the app bundle.

---

## 5. Internationalization (i18n)

Launch language is **English**; **Malayalam** is planned. The apps must be multi-language-ready from day one so adding Malayalam is a translation task, not a refactor.

- **TR-22:** No hardcoded user-facing strings anywhere — all copy lives in locale resource files (e.g., `en.json`) via an i18n library (`i18next` / `react-i18next` with `expo-localization`), shared through a `packages/i18n` package in the monorepo.
- **TR-23:** Layouts must tolerate **~30–40% string expansion** (Malayalam runs longer than English) without truncation or overflow; no text baked into images or icons.
- **TR-24:** Malayalam script support planned in: bundle **Noto Sans Malayalam** when the locale ships; dates, numbers, and currency formatted through locale-aware APIs (`Intl`), not string concatenation.
- **TR-25:** Server-sent copy (push notifications, SMS templates, Edge Function error messages) keyed by locale identifiers too — the user's preferred language is stored on `profiles` so notifications arrive in their language once Malayalam ships.

Design-side language rules (plain words, 8-word sentences, icon+word pairing) are defined in [[Design Philosophy]] §6.

---

## 6. Notifications

- **TR-26:** **Expo Push Notifications** for: new ride request (drivers), new bid received (customer), bid accepted (driver), request expired (customer), verification result (driver).
- **TR-27:** Push tokens stored per device in a `push_tokens` table; notifications sent from Edge Functions on the relevant DB events.

---

## 7. Payments (Phase 1)

- **TR-28:** Cash only: `rides.payment_method` is fixed to `cash`; the app records the agreed fare and the driver marks payment collected at ride end. No gateway, no wallet, no payouts in Phase 1.
- **TR-29:** Schema keeps `payment_method` as an enum so UPI/online payment can be added without migration pain.

---

## 8. Non-Functional Requirements

- **NFR-1:** MVP scale target: single city, low thousands of users — default Supabase tier is sufficient; no premature scaling work.
- **NFR-2:** Bid propagation latency (driver bid → customer screen) under ~2 seconds on a normal connection.
- **NFR-3:** All secrets (service role key, maps keys, KYC keys) only in Edge Function env vars / EAS secrets — never in the client bundle or repo.
- **NFR-4:** DB schema managed via Supabase migrations checked into the monorepo; types regenerated from schema.
- **NFR-5:** Battery-conscious driver tracking: reduced GPS frequency when idle-online, full frequency only during an active ride.

---

## 9. Build Order (technical phasing)

1. **Monorepo scaffold** + Supabase project, auth, `profiles`, RLS baseline.
2. **Partner app:** phone OTP sign-up/login, role selection, referral code entry, dashboard shell, referral screens (points, referred list, share).
3. **Verification flow:** document upload to Storage + manual admin review path (provider integration later).
4. **Booking backbone (backend only):** ride requests, bids, pricing, expiry, Realtime channels, Edge Functions — validated with test clients.
5. **Customer app** on top of the ready backbone.
