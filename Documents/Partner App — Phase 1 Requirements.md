# Qarmo Partner App — Phase 1 Requirements (Launch Document)

> The **Partner App** is the single application used by **auto drivers** and **delivery executives**.
> This document is the complete, self-contained plan to build and launch **Phase 1**.
> Related: [[Project Requirements]] · [[Technical Requirements]] · [[App Requirements]]

---

## 1. Purpose & Scope

**Phase 1 goal:** launch the partner app as an **acquisition and onboarding tool** — get drivers and delivery executives signed up, profiled, and referring each other *before* the customer app exists.

### In scope

| # | Feature |
|---|---|
| F1 | Sign-up flow (phone OTP + full profile wizard) |
| F2 | Login flow & session handling |
| F3 | Referral system (code, points, referral screens) |
| F4 | Dashboard (home) |
| F5 | Profile view & edit |

### Out of scope for Phase 1 (explicitly)

- ❌ Ride requests, bidding, trips, earnings — dashboard shows these as **"Coming soon"**
- ❌ KYC / document verification (removed from the project for now)
- ❌ Online/offline availability toggle
- ❌ Payments, payouts, point redemption
- ❌ Customer and restaurant apps

---

## 2. Users & Roles

- One app, one download. During sign-up the user picks their role(s):
  - **Auto Driver**
  - **Delivery Executive**
  - Both may be selected (a person can do both jobs).
- Phase 1 behavior is **identical for both roles** — role only affects which vehicle details are asked for and is stored for when ride/delivery features arrive.

---

## 3. Feature Specifications

Each feature below has: **Requirement → Expected behavior → Schema/design → Expected outcome.**

---

### F1 — Sign-up Flow

**Requirement:** A new partner can create an account with their phone number and must complete a full profile (photo included) before sign-up is considered done. An optional referral code can be applied during sign-up.

**Expected application behavior:**

```mermaid
flowchart TD
    A[Enter phone number] --> B[Receive & enter OTP]
    B --> C{OTP valid?}
    C -- no --> B
    C -- yes --> D[Step 1: Name + Photo]
    D --> E[Step 2: Select role(s)]
    E --> F[Step 3: Vehicle & city details]
    F --> G[Step 4: Referral code - optional, skippable]
    G --> H[Profile complete → Dashboard]
    H -.-> I[Referrer credited +50 points]
```

1. **Phone + OTP:** user enters a 10-digit Indian mobile number → Supabase Auth sends OTP via SMS → user enters the 6-digit code. Resend allowed after a 30 s cooldown; max 3 resends per attempt.
2. **Profile wizard** (runs immediately after first OTP success; all steps mandatory except the referral step):
   - **Step 1 — Identity:** full name (text, 2–60 chars) + profile photo (camera or gallery; compressed client-side to ≤ 500 KB before upload).
   - **Step 2 — Role selection:** Auto Driver / Delivery Executive / both (must pick at least one).
   - **Step 3 — Work details:** operating **city** (picker, launch-city list), and vehicle details per selected role:
     - Auto Driver → vehicle registration number (validated against Indian plate format).
     - Delivery Executive → vehicle registration number (validated against Indian plate format).
   - **Step 4 — Referral code (optional):** enter a code or **Skip**. An invalid code shows an inline error and never blocks sign-up.
3. **Incomplete sign-up:** if the user quits mid-wizard, next login resumes at the first incomplete step. The account exists but is flagged incomplete; the dashboard is not accessible until the wizard finishes.
4. **Completion:** finishing the wizard marks the profile complete, lands the user on the dashboard, and (if a valid code was applied) triggers the referral award — see F3.

**Schema / design:**

```sql
-- profiles: created by trigger on auth.users insert
create table profiles (
  id                   uuid primary key references auth.users(id),
  phone                text not null unique,
  full_name            text,
  photo_url            text,
  roles                text[] not null default '{}',        -- 'auto_driver' | 'delivery_executive'
  city                 text,
  referral_code        text unique,                          -- generated at completion, see F3
  profile_completed_at timestamptz,                          -- null = wizard not finished
  created_at           timestamptz not null default now()
);

create table vehicles (
  id                  uuid primary key default gen_random_uuid(),
  owner_id            uuid not null references profiles(id),
  role                text not null,                         -- which role this vehicle serves
  vehicle_type        text not null,                         -- 'auto' | 'bike' | 'scooter' | 'bicycle'
  registration_number text,                                  -- null allowed only for bicycle
  created_at          timestamptz not null default now()
);
```

- Photos go to the Supabase Storage bucket `avatars/` (path `{user_id}/profile.jpg`), public-read, owner-write.
- RLS: a user can select/update only their own `profiles` and `vehicles` rows.
- Profile completion is finalized by an Edge Function **`complete-profile`** (not direct client writes), so the completion timestamp, referral award, and code generation happen atomically.

**Expected outcome:**

- A brand-new user goes from app open → dashboard in **under 3 minutes**.
- Every completed account has: verified phone, name, photo, role(s), city, vehicle details.
- Zero accounts can reach the dashboard with a half-finished profile.
- Referral attribution is captured at sign-up and cannot be added retroactively later (keeps the ledger honest).

---

### F2 — Login Flow

**Requirement:** A returning partner logs in with phone + OTP. Sessions persist so daily use doesn't require re-login.

**Expected application behavior:**

1. Same phone + OTP screens as sign-up; the backend decides whether it's a new or returning user (no separate "register vs login" choice — one entry flow).
2. On success: profile complete → dashboard; profile incomplete → resume wizard (F1.3).
3. **Session persistence:** Supabase session stored securely on-device (`expo-secure-store`); auto-refresh keeps the user logged in until they log out. App cold-start with a valid session skips straight to the dashboard.
4. **Logout:** available from Profile; clears session and returns to the phone entry screen.
5. **Failure states:** wrong OTP (inline error, attempts limited), SMS not arriving (resend + cooldown), no network (retry banner, no crash).

**Schema / design:** no extra tables — Supabase Auth (`auth.users`) + the `profiles` row. OTP rate limits configured in Supabase Auth settings.

**Expected outcome:**

- Returning users open the app and are on their dashboard in **< 2 seconds** with no interaction.
- One unified entry flow — users never face a "do I sign up or log in?" decision.
- An attacker cannot brute-force OTPs (rate limits verified before launch).

---

### F3 — Referral System

**Requirement:** Every partner gets a personal referral code they can share. When someone signs up with that code **and completes their profile**, the referrer earns **50 points**. Partners can see their points, who they referred, and each referral's status. Points are display-only in Phase 1 (no redemption).

**Expected application behavior:**

1. **Code generation:** on profile completion, the user receives a unique code — **6 characters, uppercase letters + digits, ambiguous characters (0/O, 1/I) excluded** (e.g., `Q7XK4M`).
2. **Sharing:** a "Refer & Earn" screen shows the code prominently with **Copy** and **Share** (native share sheet with a prewritten message + app store link).
3. **Applying a code (during sign-up, F1 step 4):**
   - Valid code → stored as a **pending** referral linked to the new account.
   - Invalid / own / already-used-by-this-account code → inline error; user can correct or skip.
4. **Award:** when the referred user's profile completes, the `complete-profile` Edge Function flips the referral to **awarded**, adds **+50** to the referrer's balance, and sends the referrer a push notification: *"🎉 {name} joined with your code — you earned 50 points!"*
5. **Referral screens:**
   - **Points summary:** current total, prominently on the dashboard and the referral screen.
   - **My referrals list:** each referred person — name, date, status (`Pending` = signed up but profile incomplete, `Earned +50` = completed), newest first.
   - **How it works:** a short static explainer (3 steps: share code → they join & complete profile → you earn 50 points).

**Rules (enforced server-side, not just UI):**

| Rule | Enforcement |
|---|---|
| A user can be referred **at most once**, only at sign-up | `referrals.referred_id` is `unique`; code only enterable in the wizard |
| **No self-referral** | Edge Function rejects a code belonging to the same phone/user |
| Points awarded **exactly once** per referral | award happens in the same transaction that marks the profile complete |
| 50 points per referral, fixed | constant in the Edge Function |
| Ledger is immutable | no update/delete RLS policies on `referrals` for clients |

**Schema / design:**

```sql
create table referrals (
  id             uuid primary key default gen_random_uuid(),
  referrer_id    uuid not null references profiles(id),
  referred_id    uuid not null references profiles(id) unique,
  code_used      text not null,
  status         text not null default 'pending',   -- 'pending' | 'awarded'
  points_awarded int  not null default 0,           -- 0 while pending, 50 when awarded
  awarded_at     timestamptz,
  created_at     timestamptz not null default now(),
  check (referrer_id <> referred_id)
);

-- Points balance = ledger sum (no separately maintained counter to drift)
create view referral_points as
  select referrer_id as user_id, coalesce(sum(points_awarded), 0) as total_points
  from referrals group by referrer_id;
```

- RLS: users read referrals where they are the referrer (their list) — never rows about them as the referred party beyond their own pending state. All writes go through Edge Functions.

**Expected outcome:**

- Points are **impossible to double-award or self-award** — verified by tests (duplicate completion calls, self-code, replayed requests).
- A referrer sees a new pending referral **immediately** after their referee signs up, and the +50 lands the moment the referee finishes the wizard.
- Share-sheet referral message drives installs with the code pre-filled in the text.
- Business KPI this feature exists for: **viral onboarding** — target ≥ 30% of sign-ups arriving via referral code after week 2.

---

### F4 — Dashboard (Home)

**Requirement:** After login, the partner lands on a simple home screen centered on the referral program, with ride/delivery features visibly "coming soon".

**Expected application behavior — screen layout (top to bottom):**

```
┌─────────────────────────────────────┐
│  Hi, {first name}  [profile photo]  │  ← header, photo opens Profile
├─────────────────────────────────────┤
│  ⭐ {total} points                   │
│  Referral points earned             │  ← tappable → Referral screen
├─────────────────────────────────────┤
│  📣 Refer & Earn 50 points          │
│  Your code: Q7XK4M   [Copy] [Share] │  ← primary card
├─────────────────────────────────────┤
│  🚕 Rides & Deliveries              │
│  Coming soon — we'll notify you     │  ← static, non-interactive
├─────────────────────────────────────┤
│  Recent referrals (last 3)          │
│  • Suresh — Earned +50              │
│  • Anil — Pending                   │
│         [View all →]                │
└─────────────────────────────────────┘
```

- Pull-to-refresh reloads points and referrals.
- Push notification permission is requested on first dashboard visit (so referral-award and future "rides are live!" notifications work).
- Bottom navigation: **Home · Referrals · Profile** (three tabs only in Phase 1).

**Schema / design:** reads `profiles`, `referral_points` view, latest `referrals`. Push tokens stored in a `push_tokens (user_id, expo_token, platform, updated_at)` table.

**Expected outcome:**

- The referral program is the unmissable center of the app — a first-time user understands "share code, earn points" within seconds of landing.
- The "coming soon" card sets correct expectations (no one wonders where the rides are) and builds the notification audience for the ride-feature launch.

---

### F5 — Profile View & Edit

**Requirement:** Partners can view and edit their profile details.

**Expected application behavior:**

- **View:** photo, name, phone (read-only), role badges, city, vehicle details, referral code, member-since date.
- **Editable:** name, photo, city, vehicle details, roles (can add a role — e.g., a driver also becoming a delivery executive — which triggers the missing vehicle-details step for the new role).
- **Not editable in-app:** phone number (support-only change, out of scope), referral code (permanent).
- Logout button, app version, and links to Terms/Privacy (required for store review) at the bottom.

**Schema / design:** updates own `profiles` / `vehicles` rows under RLS; photo replacement overwrites the same storage path.

**Expected outcome:** partners keep their own data current with zero support intervention; store-review requirements (privacy policy, account deletion request path) are satisfied.

---

## 4. Consolidated Phase 1 Schema

Tables: `profiles`, `vehicles`, `referrals` (+ `referral_points` view), `push_tokens`.
Edge Functions: **`complete-profile`** (finalize wizard, generate code, validate & award referral, atomic) — the only one Phase 1 needs.
Storage: `avatars` bucket.
Realtime: not required in Phase 1 (referral list updates on refresh; award arrives via push).

*(Full column definitions are in the feature sections above; migrations live in the monorepo per [[Technical Requirements]] NFR-4.)*

---

## 5. Edge Cases & Error Handling (must-pass list)

| # | Scenario | Required behavior |
|---|---|---|
| E1 | User kills app mid-wizard | Next login resumes at first incomplete step |
| E2 | Referral code of an incomplete-profile user | Rejected — codes only exist after completion |
| E3 | Two sign-ups with the same code simultaneously | Both succeed; referrer gets 50 × 2 |
| E4 | `complete-profile` called twice (retry/replay) | Idempotent — one completion, one award |
| E5 | OTP SMS delayed/not delivered | Resend with cooldown; clear messaging |
| E6 | No network during wizard | Inputs preserved locally; retry without data loss |
| E7 | Photo upload fails | Wizard step retries; user never stuck without a way forward |
| E8 | User enters own code (via second device/session tricks) | Server-side rejection (self-referral check) |

---

## 6. Launch Checklist (Definition of Done for Phase 1)

**Build & release**
- [ ] Monorepo scaffolded (`apps/partner`, shared packages) per [[Technical Requirements]]
- [ ] Supabase project: auth (phone OTP + SMS provider configured), schema migrated, RLS enabled on all tables, `complete-profile` deployed
- [ ] EAS builds signed and submitted — Play Store + App Store listings (screenshots, descriptions, privacy policy URL)
- [ ] OTA update channel (EAS Update) configured

**Quality gates**
- [ ] All F1–F5 expected outcomes demonstrated on a physical Android + iOS device
- [ ] All edge cases E1–E8 tested and passing
- [ ] OTP rate limiting verified; RLS verified with a second test account (no cross-user reads/writes)
- [ ] Fresh-install → dashboard journey completed by a non-technical tester without help

**Day-one operations**
- [ ] SMS provider credits/quota monitored
- [ ] A way to look up a partner and their referrals (Supabase dashboard queries are acceptable for Phase 1)

---

## 7. What Phase 2 Picks Up (for context, not commitment)

Online/offline toggle → ride request feed → bidding UI → active ride flow with live tracking → earnings — all on the booking backbone already specified in [[Technical Requirements]] §3. The customer app launches alongside this, and "Coming soon" flips to live via push notification to every registered partner.
