# Qarmo — App Requirements (Structured)

## 1. Overview

Qarmo is a combined **taxi booking** and **restaurant delivery** platform. It consists of:

1. **Taxi booking service** — covers auto, bike, and cab bookings.
   - **Phase 1 focuses only on auto booking.**
   - Bike and cab booking will be added in later phases, so the system must be designed with these future additions in mind.
2. **Restaurant delivery service** — includes:
   - An application for **restaurant owners**.
   - An application for **delivery executives**.

### Applications

| App | Users | Notes |
|---|---|---|
| Driver / Executive App | Auto drivers + delivery executives | A **single app** (one download from App Store / Play Store); the user logs in based on their role or selects the role during onboarding |
| Customer App | End customers | Booking rides (Phase 1: auto) |
| Restaurant Owner App | Restaurant owners | Later phase |

---

## 2. Current Development Scope

The immediate goal is to **onboard delivery executives and auto drivers**, so the current build targets the **Driver / Executive app** with:

1. **Sign-up flow**
2. **Login flow**
3. **Dashboard** (standard driver / delivery-executive dashboard)

---

## 3. Referral System (Driver / Executive Onboarding)

- Drivers/executives can sign up **using a referral ID** of an existing user, or be referred by them.
- **Referral is optional** — anyone can sign up on their own without a referral.
- When a referred person signs up, the **referrer earns points** (e.g., **50 points** per onboarded driver).

### Referral-related screens/options needed

- View **collected referral points**.
- A section explaining / enabling **how to refer others** (share referral ID).
- View **total points earned**.
- View the **list of people they have referred** and related details.

---

## 4. Customer App — Ride Booking with Bidding

The customer app will **not** follow the typical flow (customer requests → any driver accepts at a fixed price). Instead, a **bidding flow** is used:

1. Customer selects **pickup location** and **destination**, then places a ride request.
2. A **base price** is shown — the standard rate for that route based on distance (e.g., ₹100).
3. Available drivers see the request and can respond with a **bid**:
   - Accept at the base price (100), or
   - Offer lower (e.g., 90), or
   - Offer higher (e.g., 110, 120, …).
   - The driver UI for counter-offering must be **very simple**.
4. As drivers accept/bid, their offers **appear on the customer's screen in real time**.
5. The customer **chooses one driver** from the received offers (one or many).

Apart from this bidding flow, **all other features are similar to a regular taxi booking app**.
