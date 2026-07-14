# Qarmo — Project Requirements (Business & Functional)

## 1. Business Overview

Qarmo is a platform offering two services:

1. **Taxi booking** — auto, bike, and cab rides.
2. **Restaurant delivery** — food ordering and delivery from restaurants.

### Phasing

- **Phase 1:** Auto booking only. The **driver/executive app is the first deliverable**, while the platform foundation is built to already support customer booking and the bidding flow (so the customer app can follow without rework).
- **Later phases:** Customer app rollout, bike booking, cab booking, and the restaurant delivery service.

### User Roles

- **Customer** — books rides (and later, orders food).
- **Auto Driver** — accepts and fulfills ride requests.
- **Delivery Executive** — delivers restaurant orders.
- **Restaurant Owner** — manages restaurant orders (later phase).

Auto drivers and delivery executives use the **same application**, with their experience determined by the role they choose or log in as. A person's role is established during onboarding.

---

## 2. Driver / Delivery Executive — Functional Requirements

### 2.1 Onboarding & Access

- **FR-1:** A driver or delivery executive shall be able to **sign up** for the platform.
- **FR-2:** A registered driver/executive shall be able to **log in**.
- **FR-3:** During sign-up, the user may optionally provide a **referral ID** of an existing driver/executive.
- **FR-4:** Sign-up without a referral must be fully supported — referral is **optional**, never mandatory.
- **FR-4a:** Sign-up gives **immediate access** to the app (sign up now, verify later) — a new driver/executive can log in, explore the dashboard, and use the referral features right away.
- **FR-4b:** Document submission and verification happen **after sign-up**; a driver/executive can only **start taking rides or deliveries once verified/approved**.

### 2.2 Referral & Rewards

- **FR-5:** When a new driver/executive signs up using a referral ID, the **referrer earns reward points** (e.g., 50 points per successful onboarding).
- **FR-5a:** Points are a **display-only score for now** — they accumulate and are shown to the user, but cannot yet be redeemed. Redemption rules will be defined later.
- **FR-6:** A driver/executive shall be able to view their **total collected referral points**.
- **FR-7:** A driver/executive shall have a way to **refer others** (view and share their own referral ID).
- **FR-8:** A driver/executive shall be able to view a **list of everyone they have referred**, along with the points earned from each referral.

### 2.3 Dashboard

- **FR-9:** After login, the driver/executive shall land on a **dashboard** providing the standard capabilities expected of a driver / delivery-executive app (availability, incoming requests, trip/delivery activity, earnings, profile).

---

## 3. Customer — Functional Requirements (Ride Booking)

### 3.1 Placing a Ride Request

- **FR-10:** A customer shall be able to select a **pickup location** and a **destination**, then place a ride request.
- **FR-11:** When the request is placed, the customer shall be shown a **base price** — the standard fare for that route, calculated from the distance.

### 3.2 Driver Bidding

- **FR-12:** All available drivers shall be able to see the customer's ride request.
- **FR-13:** A driver shall be able to respond to a request in one of three ways:
  - **Accept at the base price**, or
  - **Bid lower** than the base price, or
  - **Bid higher** than the base price.
- **FR-14:** Submitting or adjusting a bid must be an **effortless, minimal-step action** for the driver.

### 3.3 Choosing a Driver

- **FR-15:** Every driver offer (acceptance or bid) shall appear on the **customer's screen as it arrives**.
- **FR-16:** The customer shall be able to review all received offers and **select one driver** to confirm the ride.
- **FR-16a:** A ride request that receives no offers, or where the customer doesn't select one, **automatically expires after a fixed time window** (e.g., 2–5 minutes). The customer can then place a new request.

### 3.4 Everything Else

- **FR-17:** Apart from the bidding flow above, the customer experience shall match that of a **standard taxi booking app** (ride tracking, driver details, ride history, ratings, payments, etc.).

---

## 4. Business Rules

- **BR-1:** Referral rewards are granted to the **referrer** upon successful onboarding of the referred driver/executive (e.g., 50 points each).
- **BR-2:** The **base price** of a ride is the standard rate for the route, determined by distance.
- **BR-3:** Drivers set their own price relative to the base price — the platform does not restrict them to the base fare.
- **BR-4:** The **customer decides** which offer to accept; a ride is only confirmed once the customer selects a driver.
- **BR-5:** One person may act as both an auto driver and a delivery executive; the services must be planned so bike and cab bookings can be introduced later without changing the customer-facing flows.
- **BR-6:** Referral points have **no monetary value yet**; redemption (cash, credit, or otherwise) is a future decision.
- **BR-7:** An unverified driver/executive can use the app (profile, referrals, dashboard) but **cannot go online or accept work** until verification is complete.
- **BR-8:** Ride requests are **time-boxed**: they expire automatically if not confirmed within the bidding window, and expired requests must be re-placed by the customer.
