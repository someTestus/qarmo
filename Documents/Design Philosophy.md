# Qarmo — Design Philosophy

> How every Qarmo screen must look, feel, and behave.
> Written for the **Partner App** first (auto drivers & delivery executives in rural Kerala), and it applies to all future apps.
> Related: [[Partner App — Phase 1 Requirements]] · [[Technical Requirements]] · [[Project Requirements]]

---

## 1. Who We Design For

Our first users are **auto drivers and delivery executives in rural Kerala**:

- Not tech-savvy; many have **limited reading comfort** — they may recognize words slowly, not read paragraphs.
- Often first-generation smartphone users; their reference point is **WhatsApp, the phone dialer, and Google Pay** — nothing more complex.
- Use **budget Android phones**, often with cracked/dim screens, **in direct sunlight**, on patchy 4G.
- Language: Malayalam speakers. The app launches in **simple English**, and must be ready for Malayalam later.

**The bar:** a driver who has never seen Qarmo should be able to sign up and share his referral code **without anyone teaching him** — by the second time, from muscle memory.

---

## 2. The Five Design Principles

### P1 — One thing per screen
Every screen has exactly **one job** and **one big primary button**. Never two competing actions. If a screen needs two decisions, it becomes two screens. The sign-up wizard is the model: one question at a time, one "Continue" button.

### P2 — Show, don't write
- Every action pairs an **icon + one or two words** — never text alone, never an icon alone.
- Numbers do the talking: points, money, and counts are displayed **huge** (the ₹ or ⭐ figure is the headline; the label under it is small).
- No paragraphs anywhere in the app. Maximum sentence length on any screen: **8 words**.
- Photos and familiar symbols over abstract illustrations: an auto-rickshaw, a phone, a share arrow — things they see daily.

### P3 — Big, forgiving, and honest
- Touch targets **minimum 56 dp**; primary buttons **full-width, 56–64 dp tall**, at the **bottom of the screen** (thumb zone).
- Every tap gives instant feedback (press state + subtle haptic).
- Destructive or final actions always get a simple confirm ("Log out? **Yes / No**").
- No dead ends: every error screen tells the user what to do next in plain words ("No internet. **Try again**").

### P4 — Nothing that isn't needed
- If a feature, field, banner, or setting is not required for the user's next action, it does not appear. No promotional clutter, no badges, no carousels.
- Empty states teach: an empty referral list shows *how* to refer (icon + 3-step visual), not just "No data".
- Settings are nearly nonexistent in Phase 1 — the app just works.

### P5 — Built for sunlight and small phones
- **Light theme only** at launch, tuned for outdoor readability: near-black text on white, strong contrast everywhere (WCAG AA minimum, AAA for body text).
- Works one-handed on a 5-inch screen; nothing important hides behind gestures, long-presses, or hamburger menus. **Visible bottom tabs only.**

---

## 3. Color Theme

The palette comes from the streets we serve — the auto-rickshaw's yellow — but **deliberately restyled away from Rapido's bright yellow-and-black identity**: Qarmo uses a **deeper amber on mostly-white screens**, never yellow-flooded surfaces or black-dominant headers.

### 3.1 Core palette

| Role | Name | Hex | Usage |
|---|---|---|---|
| **Primary** | Deep Amber | `#E8A400` | Primary buttons, active tab — the single amber element per screen |
| **Primary-pressed** | Burnt Amber | `#C78D00` | Pressed/active state of amber elements |
| **Ink** | Rickshaw Black | `#1A1A1A` | All body text, icons, text **on yellow** |
| **Success / Money** | Kerala Green | `#1B7A3D` | Points earned, success states, confirmations, ₹ amounts |
| **Danger** | Brick Red | `#C62828` | Errors, destructive confirms only |
| **Info** | Sky Blue | `#1565C0` | Links, informational notes (used sparingly) |
| **Background** | White | `#FFFFFF` | Screen background |
| **Surface** | Mist | `#F4F5F7` | Cards, input fills |
| **Border** | Line Grey | `#D9DCE1` | Card borders, dividers |
| **Muted text** | Grey | `#5F6570` | Secondary labels only — never for anything the user must read |

### 3.2 Approved combinations (use only these)

| Combination | Where | Contrast |
|---|---|---|
| Rickshaw Black on Deep Amber | Primary buttons, highlights | ~8.5:1 ✅ |
| Rickshaw Black on White | All reading text | ~17:1 ✅ |
| White on Kerala Green | Success buttons/banners | ~5.9:1 ✅ |
| White on Brick Red | Error banners | ~6.4:1 ✅ |
| Rickshaw Black on Mist | Card content | ~15:1 ✅ |
| Grey `#5F6570` on White | Small secondary labels only | ~5.6:1 ✅ |

### 3.3 Hard color rules

1. **Amber is never used for text** — it's a fill/accent color only, always carrying black text or icons.
2. **Color never carries meaning alone** — success is green **+ ✓ icon + word**; error is red **+ ⚠ icon + word**. (Covers color-blind users and reinforces meaning for low-literacy users.)
3. **One amber element per screen** — the primary action. If everything is amber, nothing is.
4. Green is reserved for **money and success** so it builds a single association: *green = good, earned*.
5. Red appears **only** on errors and destructive confirmations — never decoratively.

### 3.4 Differentiation from Rapido (and other yellow apps)

Rapido's identity is **bright yellow (#FDD835-ish) flooding whole surfaces, paired with heavy black**. Qarmo must never be mistakable for it:

- **Screens are white, not yellow.** Amber appears only on the primary button/active element — never as a screen, header, or splash background.
- **Deep amber `#E8A400`, never bright yellow.** No tints of the primary brighter than `#E8A400` anywhere in the app.
- **No black-dominant surfaces.** Black is text and icons only, never backgrounds or headers.
- **Green is our second voice.** The money/success green (`#1B7A3D`) appears throughout the earnings and referral experience, giving Qarmo an amber-green character Rapido doesn't have.
- **App icon and splash** lead with the Qarmo mark on white (or green), not a yellow tile — the store listing must not read "yellow taxi app".

---

## 4. Typography

- **Typeface:** system default (Roboto on Android, SF on iOS) — fastest, most familiar, best rendering on budget phones. When Malayalam arrives: **Noto Sans Malayalam** as the companion face.
- All text **left-aligned**, sentence case. No ALL-CAPS words (harder to read), no italics, no thin weights.

| Style | Size / weight | Use |
|---|---|---|
| Hero number | 40 px / Bold | Points balance, money figures |
| Title | 24 px / Bold | Screen title (one per screen) |
| Button | 18 px / SemiBold | All buttons |
| Body | 18 px / Regular | Everything the user must read |
| Caption | 14 px / Regular, Grey | Timestamps, secondary labels only |

**Floor:** nothing the user *needs* to read is ever below 16 px. Line height ≥ 1.4.

---

## 5. Components & Patterns

### Buttons
- **Primary:** full-width, Deep Amber, black text + leading icon, 16 px corner radius, bottom-anchored. One per screen (P1).
- **Secondary:** white with `1.5 px` Line Grey border, black text. Sits above or below primary, never beside it.
- Disabled buttons are visibly grey **with a one-line reason above them** ("Enter your name to continue") — the user must never wonder why a button won't work.

### Forms & inputs
- One field per screen in the wizard; label **above** the field (never placeholder-only labels), 18 px text inside.
- The right keyboard automatically: number pad for phone/OTP, caps for vehicle plates.
- Validate on submit with a plain-words inline message + red border; never a technical error string.

### Cards
- White or Mist, 16 px radius, generous padding (16–20 px), one topic per card. The whole card is tappable (not a tiny link inside it).

### Progress & waiting
- Wizard shows steps as **dots with a count ("2 of 4")**, not percentages.
- Anything slower than ~300 ms shows a spinner **with a word** ("Sending…"); anything slower than 5 s must be cancellable or retryable.

### Icons
- Filled, thick-stroke icons (Material Symbols – Rounded), always **28 px+**, always black or green, always with a label beneath or beside.

### Navigation
- **Three bottom tabs, always visible: Home · Referrals · Profile** — icon + label each.
- No hamburger menu, no hidden gestures, no horizontal swiping between pages. Back means back, predictably.

---

## 6. Voice & Language

- **Simple English**, spoken-style, at launch: "You earned 50 points", "Share your code", "Try again".
- Words we use: *earn, share, points, code, photo, try again*. Words we never use: *authenticate, invalid, error 400, session, verify, submit*.
- Every message answers "what happened?" and "what do I do now?" in one short line each.
- **Multi-language readiness is a design rule, not just technical:** no text baked into images, buttons sized to survive ~30–40% longer Malayalam strings, and layouts that don't break when a word wraps to two lines. (Technical i18n requirements: see [[Technical Requirements]] §5.)

---

## 7. What This Looks Like in Phase 1 (worked examples)

- **Sign-up wizard:** one question per screen, "2 of 4" dots, one giant amber Continue button, number pad already open on the phone screen.
- **Dashboard:** points figure in 40 px green with a star, the amber **Share my code** card as the single amber element, a calm grey "Rides — coming soon" card, three labelled tabs.
- **Referral list:** each row = photo, first name, and either **"+50" in green** or **"Waiting…" in grey** — status readable at a glance without reading.
- **Errors:** "No internet. **Try again**" with a retry button — never a red toast that vanishes before it's read.

---

## 8. Design Checklist (every new screen must pass)

- [ ] One job, one primary (amber) action, bottom-anchored
- [ ] Every action = icon + word; no icon-only or text-only buttons
- [ ] Nothing the user must read is under 16 px or in grey
- [ ] Meaning never carried by color alone
- [ ] All touch targets ≥ 56 dp
- [ ] Readable in sunlight (contrast pairs from §3.2 only)
- [ ] No sentence over 8 words; no jargon words
- [ ] Survives 40% longer strings without breaking (Malayalam-ready)
- [ ] A first-time, low-literacy user can complete it unaided
