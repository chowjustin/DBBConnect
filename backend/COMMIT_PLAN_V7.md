# Commit Plan V7 — Consolidated MVP

V1 shipped (14 commits in git). V2, V3, V4, V5, V6 deprecated. **V7 = V5 + V6 merged, grouped into 13 commits.**

Each commit is a PR-sized, self-contained, reviewable chunk. Schema and matching endpoints land together so deploy state is always coherent.

Conventions: `feat(be):` / `fix(be):` / `chore(be):`. Comma list, single `and` before last item.

---

## Decisions (resolved)

- **3 roles:** TUTOR, STUDENT, ADMIN. Admin created via CLI seed or admin-only invite. Admin has no profile.
- **Payment flow:** photo-first. No Payment row exists until proof uploaded. Server computes amount.
- **Payout flow:** Pattern B — wallet + manual withdraw. Tutor accumulates, requests, admin pays manually.
- **Platform bank:** Option B settings table, snapshot into Payment row.
- **Tutor bank:** single fields on `TutorProfile`, snapshot into Payout row.
- **Hourly rate:** recommended only (p25/p50/p75 endpoint). No enforcement.
- **WhatsApp:** required on tutor, optional on student.
- **First-session discount:** skipped.
- **Trust & safety (block/report/dispute/anti-fraud):** deferred to V8+.
- **Third-party integrations** (Xendit, OAuth, video, chat, SMS): deferred.

---

## Current State Audit

Verified against git log (`main` branch):
- V1 shipped: JWT secret, ValidationPipe, schema unique/onDelete/updatedAt, multer best practices, upload module, materials guards, atomic apply, role guard scaffolding, exception filter, throttler, scaffold cleanup, bcrypt dup removed.

Not yet built (V7 covers all of it):
- Admin bootstrap, profile depth, WhatsApp, material categorization, application message
- Email verification, password reset
- Tutor verification workflow + bank fields + publish gate + completeness score
- Sessions, attendees, availability slots, booking with conflict, drop legacy fields
- Photo-first Payment + PlatformBankAccount + IdempotencyKey + admin confirm/reject
- TutorWallet + WalletLedger + Payout (request, admin approve, mark paid, reject)
- Subscription + FeaturedListing + PromoCode + StudentCredit
- Referral program
- Search filters with rating, leaderboard collections, hourly rate suggestion
- Dashboards (tutor, student) + analytics (tutor, student, admin)
- MaterialView, SessionFeedback, SearchLog
- Reminders cron, blackout dates, iCal export
- Full e2e flow

---

## Commit Plan

### Commit 1 — [x] `feat(be): expand profiles, material categorization, application message and admin bootstrap`
**Schema:**
- `TutorProfile`: `educationBackground String?`, `teachingMethods TeachingMethod[]`, `educationLevels EducationLevel[]`, `introVideoUrl String?`, `whatsappNumber String` (required), `bankName String?`, `bankAccountNumber String?`, `bankAccountHolder String?`.
- `StudentProfile`: `whatsappNumber String?` (optional).
- `Application`: `message String?` (max 500 chars).
- `Material`: `subject Subject`, `level EducationLevel`, `kind MaterialKind`, `description String?`.
- Enums: `EducationLevel { JUNIOR_HIGH, SENIOR_HIGH, UNIVERSITY }`, `TeachingMethod { VISUAL, DISCUSSION, INTENSIVE, STRUCTURED }`, `MaterialKind { NOTE, VIDEO, EXERCISE, SUMMARY }`.

**Auth:**
- `auth.service.register`: accept WhatsApp (required for TUTOR), validate E.164.
- `auth.service.createAdmin` (internal, not exposed): creates User with role=ADMIN, no profile.
- New CLI script `scripts/create-admin.ts`: idempotent admin seed.
- `POST /admin/users/invite` (`@Roles(ADMIN)`): existing admin creates another.

**DTOs:**
- Update `CreateTutorDto`, `UpdateTutorDto`, `CreateStudentDto`, `UpdateStudentDto`, `CreateApplicationDto`, `CreateMaterialDto` accordingly.

Migration note: backfill existing tutor `whatsappNumber` with empty string; block tutor dashboard until filled.

---

### Commit 2 — [x] `feat(be): email verification and password reset`
**Schema:**
- `User.emailVerifiedAt DateTime?`.
- `PasswordResetToken { id, userId, tokenHash, expiresAt, usedAt, createdAt }`. Index `[userId, expiresAt]`.
- `EmailVerificationToken`: same shape.

**Endpoints:**
- `POST /auth/forgot`: always 200 (no email enumeration). Throttle 5/h/IP.
- `POST /auth/reset`: verify hash, expiry (1h), unused. Hash new password, mark used, invalidate refresh tokens.
- `POST /auth/verify-email`: set `emailVerifiedAt`.
- `POST /auth/resend-verification`: throttled 3/h/user.
- On `auth.register`: create EmailVerificationToken, mail link.

**Guard:**
- New `@EmailVerified` decorator + guard. Blocks `POST /payments/upload-proof`, `POST /sessions`, `POST /tutor/payouts` if `emailVerifiedAt = null`. Read endpoints allowed.

---

### Commit 3 — [x] `feat(be): tutor verification workflow, completeness score and publish gate`
**Schema:**
- `TutorProfile`: `verificationStatus VerificationStatus @default(PENDING)`, `verifiedAt DateTime?`, `verificationNotes String?`, `idDocumentUrl String?`, `educationProofUrl String?`, `publishedAt DateTime?`.
- Enum `VerificationStatus { PENDING, VERIFIED, REJECTED }`.

**Endpoints:**
- `POST /tutors/verification` (`@Roles(TUTOR)`): upload doc URLs, set status PENDING.
- `GET /admin/tutors/verification?status=PENDING` (`@Roles(ADMIN)`): queue.
- `PATCH /admin/tutors/:id/verification` (`@Roles(ADMIN)`): VERIFIED or REJECTED + notes, mail tutor.
- `GET /tutors/me/completeness`: returns score 0–100 + missing fields.
  - Weights: bio 10, educationBackground 10, teachingMethods≥1 10, educationLevels≥1 5, subjects≥1 10, hourlyRate 10, introVideoUrl 10, whatsappNumber 5, bank trio 10, availability≥1 10, verified 10.
- `POST /tutors/publish` (`@Roles(TUTOR)`): requires score ≥ 80 + verified. Sets `publishedAt`.
- `POST /tutors/unpublish`: clears `publishedAt`.

**Search behavior:**
- Default search shows only `publishedAt IS NOT NULL` AND `verificationStatus = VERIFIED`.

---

### Commit 4 — [x] `feat(be): sessions, attendees, availability, booking and drop legacy scheduling`
**Schema:**
```prisma
enum SessionStatus { SCHEDULED COMPLETED CANCELED NO_SHOW }
enum ClassFormat   { PRIVATE_1 SEMI_PRIVATE GROUP }
enum ClassMode     { ONLINE OFFLINE }

model Session {
  id            String        @id @default(cuid())
  applicationId String?
  tutorId       String
  startsAt      DateTime
  endsAt        DateTime
  status        SessionStatus @default(SCHEDULED)
  format        ClassFormat   @default(PRIVATE_1)
  mode          ClassMode     @default(ONLINE)
  pricePerSeat  Int           // rupiah snapshot at booking
  meetingUrl    String?       // tutor pastes Zoom/Meet manually
  location      String?
  notes         String?
  reminderSentAt DateTime?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  application   Application?   @relation(fields: [applicationId], references: [id], onDelete: SetNull)
  tutor         TutorProfile   @relation(fields: [tutorId], references: [id])
  attendees     SessionAttendee[]

  @@index([tutorId, startsAt])
}

model SessionAttendee {
  id          String  @id @default(cuid())
  sessionId   String
  studentId   String
  attended    Boolean @default(false)
  paymentId   String? @unique  // set when Payment confirmed

  session     Session        @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  student     StudentProfile @relation(fields: [studentId], references: [id])

  @@unique([sessionId, studentId])
  @@index([studentId])
}

model AvailabilitySlot {
  id        String @id @default(cuid())
  tutorId   String
  dayOfWeek Int    // 0..6
  startMin  Int    // minutes since midnight
  endMin    Int
  timezone  String // IANA

  tutor     TutorProfile @relation(fields: [tutorId], references: [id], onDelete: Cascade)
  @@index([tutorId, dayOfWeek])
}

model BlackoutDate {
  id       String   @id @default(cuid())
  tutorId  String
  startsAt DateTime
  endsAt   DateTime
  reason   String?

  tutor    TutorProfile @relation(fields: [tutorId], references: [id], onDelete: Cascade)
  @@index([tutorId, startsAt])
}
```

Drop: `Application.scheduledAt`, `TutorProfile.availability Json?`.

**Endpoints:**
- `PUT /tutors/availability` (`@Roles(TUTOR)`): replace slots via `prisma.$transaction([deleteMany, createMany])`. Validate `timezone` via `Intl.supportedValuesOf('timeZone')`.
- `GET /tutors/:tutorId/availability`: public.
- `POST /tutors/blackout`, `DELETE /tutors/blackout/:id`: tutor manages own.
- `POST /sessions` (`@Roles(STUDENT)`): body `{ tutorId, format, mode, startsAt, endsAt, attendeeStudentIds[], pricePerSeat? }`.
  - Validate ACCEPTED application for each attendee, slot inside availability, no overlap with existing SCHEDULED sessions, no blackout overlap, attendee count matches format.
  - All inside `prisma.$transaction`.
  - No Payment row yet.
  - Idempotency-Key required.
- `PATCH /sessions/:id`: status transitions (SCHEDULED → COMPLETED / CANCELED / NO_SHOW). Role-gated.
- `GET /sessions/student` and `GET /sessions/tutor`: upcoming or `?past=true`.
- `GET /sessions/:id/ical`: returns `.ics`.

**Helper:** `src/common/tz.ts`:
- `utcToLocalMinutes(date, tz)` → `{ dayOfWeek, minutes }`.
- `isInsideSlot({ start, end }, slot)`.
- Uses `date-fns-tz` (one new dep).

**Mail:** `sendSessionBookedEmail`, `sendSessionCanceledEmail` wired.

---

### Commit 5 — [x] `feat(be): photo-first payment, platform bank settings and idempotency`
**Schema:**
```prisma
enum PaymentStatus { UNDER_REVIEW CONFIRMED REJECTED REFUNDED }
enum PaymentMethod { BANK_TRANSFER QRIS EWALLET OTHER }
enum PaymentKind   { SESSION SUBSCRIPTION FEATURED_LISTING }

model PlatformBankAccount {
  id            String   @id @default(cuid())
  bankName      String
  accountNumber String
  accountHolder String
  isActive      Boolean  @default(true)
  notes         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Payment {
  id                String        @id @default(cuid())
  kind              PaymentKind
  sessionAttendeeId String?       @unique
  subscriptionId    String?
  featuredListingId String?
  payerId           String
  payeeTutorId      String?       // null for SUBSCRIPTION, FEATURED_LISTING
  grossAmount       Int
  discountAmount    Int           @default(0)
  commission        Int
  netAmount         Int
  method            PaymentMethod
  status            PaymentStatus @default(UNDER_REVIEW)
  proofUrl          String        // required — exists only after upload
  receivedToBank    String        // snapshot e.g. "BCA 1234567890 PT DBBConnect"
  promoCodeId       String?
  reviewedBy        String?
  reviewedAt        DateTime?
  notes             String?
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  @@index([payerId, createdAt])
  @@index([status])
}

model IdempotencyKey {
  key              String   @id
  userId           String
  endpoint         String
  responseSnapshot Json
  createdAt        DateTime @default(now())

  @@index([userId, createdAt])
}
```

**Endpoints:**
- `GET /admin/platform-bank` (`@Roles(ADMIN)`): list.
- `POST /admin/platform-bank` / `PATCH /admin/platform-bank/:id` (`@Roles(ADMIN)`).
- `GET /payment-instructions`: returns active banks. Used by frontend "How to pay" page.
- `POST /payments/upload-proof` (multipart): body `{ kind, refId, method, promoCode?, proofImage }`.
  - `refId` resolves to: `sessionAttendeeId` (SESSION), tier (SUBSCRIPTION), days (FEATURED_LISTING).
  - Server computes `grossAmount` from refId. Never trust client.
  - Snapshots `receivedToBank` from active `PlatformBankAccount`. Reject if no active bank.
  - Creates Payment row with status `UNDER_REVIEW`.
  - `Idempotency-Key` header required.
- `GET /admin/payments?status=UNDER_REVIEW` (`@Roles(ADMIN)`): queue.
- `PATCH /admin/payments/:id/confirm` (`@Roles(ADMIN)`):
  - SESSION: credit `TutorWallet.availableBalance += netAmount`, write `WalletLedger`, set `SessionAttendee.paymentId`.
  - SUBSCRIPTION: upsert `Subscription` (tier, expiry).
  - FEATURED_LISTING: activate `FeaturedListing`.
  - All in `prisma.$transaction`.
- `PATCH /admin/payments/:id/reject` (`@Roles(ADMIN)`): status REJECTED + notes. Mail student.
- `GET /payments/mine`: caller's history.

**Interceptor:** `src/common/idempotency.interceptor.ts`. Reads `Idempotency-Key`, stores response snapshot keyed by `(userId, key)`. Replays cached response on duplicate within 24h.

**Cron:** delete `IdempotencyKey` rows > 7d.

---

### Commit 6 — [x] `feat(be): tutor wallet, ledger and payouts`
**Schema:**
```prisma
enum PayoutStatus { REQUESTED PAID REJECTED }

model TutorWallet {
  id               String   @id @default(cuid())
  tutorId          String   @unique
  availableBalance Int      @default(0)
  pendingBalance   Int      @default(0) // reserved for future cooldown
  lifetimeEarned   Int      @default(0)
  updatedAt        DateTime @updatedAt

  tutor   TutorProfile @relation(fields: [tutorId], references: [id])
}

model WalletLedger {
  id        String   @id @default(cuid())
  tutorId   String
  delta     Int                       // + credit, - debit
  reason    String                    // PAYMENT_CONFIRMED, PAYOUT_REQUESTED, PAYOUT_PAID, PAYOUT_REJECTED, REFUND
  paymentId String?
  payoutId  String?
  createdAt DateTime @default(now())

  @@index([tutorId, createdAt])
}

model Payout {
  id              String       @id @default(cuid())
  tutorId         String
  amount          Int
  bankName        String       // snapshot
  bankAccount     String
  accountHolder   String
  status          PayoutStatus @default(REQUESTED)
  proofUrl        String?
  rejectionReason String?
  requestedAt     DateTime     @default(now())
  paidAt          DateTime?
  reviewedBy      String?

  tutor   TutorProfile @relation(fields: [tutorId], references: [id])

  @@index([tutorId, requestedAt])
  @@index([status])
}
```

**Endpoints:**
- `GET /tutor/wallet` (`@Roles(TUTOR)`): balance + recent ledger.
- `POST /tutor/payouts` (`@Roles(TUTOR)`): request withdraw.
  - Require verified, bank fields set, `amount >= MIN_PAYOUT_RUPIAH` (env, default 50000), `amount <= availableBalance`, no existing REQUESTED row.
  - Snapshot bank from TutorProfile.
  - Transaction: create Payout, deduct balance, write ledger debit.
  - Idempotency-Key required.
- `GET /tutor/payouts`: history.
- `GET /admin/payouts?status=REQUESTED` (`@Roles(ADMIN)`): queue.
- `POST /admin/payouts/:id/mark-paid` (multipart): admin uploads transfer proof. Status PAID + `paidAt` + `proofUrl`. Ledger informational row.
- `POST /admin/payouts/:id/reject`: status REJECTED + reason. Refund balance, ledger credit.
- Mail tutor on every transition.

**Auto-create wallet:** on first PAYMENT_CONFIRMED for a tutor.

---

### Commit 7 — [x] `feat(be): subscription, featured listing, promo codes and student credit`
**Schema:**
```prisma
enum PlanTier { FREE PREMIUM_STUDENT PRO_TUTOR }
enum DiscountType { PERCENT FIXED }

model Subscription {
  id        String   @id @default(cuid())
  userId    String   @unique
  tier      PlanTier @default(FREE)
  startedAt DateTime @default(now())
  expiresAt DateTime?
  autoRenew Boolean  @default(false)
  user      User     @relation(fields: [userId], references: [id])
}

model FeaturedListing {
  id          String   @id @default(cuid())
  tutorId     String   @unique
  activeUntil DateTime
  tutor       TutorProfile @relation(fields: [tutorId], references: [id])
}

model PromoCode {
  id              String        @id @default(cuid())
  code            String        @unique
  discountType    DiscountType
  discountValue   Int
  validUntil      DateTime
  maxUses         Int
  currentUses     Int           @default(0)
  applicableKinds PaymentKind[]
  minAmount       Int?
  createdBy       String
  createdAt       DateTime      @default(now())
}

model StudentCredit {
  id           String   @id @default(cuid())
  studentUserId String  @unique
  balance      Int      @default(0)
  updatedAt    DateTime @updatedAt
  user         User     @relation(fields: [studentUserId], references: [id])
}
```

**Endpoints:**
- `GET /subscription/me`: tier + expiry.
- `POST /subscription/request`: returns refId for `POST /payments/upload-proof`.
- `@RequireTier(PREMIUM_STUDENT)` decorator + guard for gated routes.
- `POST /featured/request` (`@Roles(TUTOR)`): tutor requests boost N days. Returns refId.
- `POST /admin/promo-codes` (`@Roles(ADMIN)`): create.
- `POST /payments/preview-discount`: body `{ kind, refId, code }`. Returns `{ gross, discount, net }`. No row created.
- Promo and StudentCredit stack (both decrement gross). Document order: credit first, then promo % on remainder, then commission.

**Crons:**
- Daily: expire subscriptions past `expiresAt`.
- Nightly: clear `FeaturedListing` past `activeUntil`.

---

### Commit 8 — [x] `feat(be): referral program with reward credit`
**Schema:**
- `User.referralCode String @unique` (auto 8-char alphanumeric on register).
- `User.referredById String?` (inviter userId).
- `ReferralReward { id, referrerId, referredId, triggeredByPaymentId, creditAmount Int, status (PENDING, GRANTED), createdAt }`.

**Endpoints:**
- `auth.register`: accept optional `referralCode` body field. Resolve, set `referredById`.
- Hook on `PATCH /admin/payments/:id/confirm`: if confirmed Payment is the referred user's first SESSION CONFIRMED → create PENDING `ReferralReward` (referrer + referred, each fixed amount from env).
- `POST /admin/referrals/:id/grant` (`@Roles(ADMIN)`): mark GRANTED, credit `StudentCredit.balance` for each side (or `TutorWallet` if referrer is tutor).
- `GET /me/referrals`: count, rewards, total earned.

Reward amounts in env: `REFERRAL_REWARD_REFERRER_RUPIAH`, `REFERRAL_REWARD_REFERRED_RUPIAH`.

---

### Commit 9 — [x] `feat(be): search filters, rating, featured boost, leaderboard and rate suggestion`
- `tutors.service.search`: accept `minRating`, `educationLevel`, `methods[]`, `format[]`, `mode[]`, `sortBy` (`rating`, `priceAsc`, `priceDesc`, `featured`). Default sort boosts active `FeaturedListing`, marks `featured: true`. Filter only `publishedAt != null` + `verificationStatus = VERIFIED`.
- Compute `averageRating` via Prisma `aggregate`. Merge into response.
- `materials.service` list endpoints: accept `subject`, `level`, `kind` filters.
- `GET /tutors/collections`:
  - `top-rated`: top 10 by avg rating, min 5 reviews.
  - `most-active`: top 10 by completed Session count last 30d.
  - `new`: published in last 14d.
  - `top-in-:subject`: top 5 by avg rating within subject.
  - In-memory LRU cache, 5min TTL.
- `GET /tutors/rate-suggestion?subject=...&level=...&experience=...` (`@Roles(TUTOR)`):
  - Returns `{ p25, p50, p75, sampleSize }` from `aggregate` of matching tutors.
  - Falls back to subject-only if sample < 5.

---

### Commit 10 — [x] `feat(be): dashboards, analytics for tutor, student and admin`
**Tutor:**
- `GET /dashboards/tutor` (`@Roles(TUTOR)`): active students, pending applications, upcoming sessions, materials count, average rating, recent reviews (top 5), monthly confirmed earnings.
- `GET /dashboards/tutor/analytics`: sessions per week (12w), earnings trend (12w), application → accepted → completed funnel, rating trend monthly, most-accessed materials.

**Student:**
- `GET /dashboards/student` (`@Roles(STUDENT)`): active tutors, upcoming sessions, recent materials, application counts, current tier, sessions completed total, hours studied, subjects covered, average rating given, spending last 30d.

**Admin:**
- `GET /admin/analytics/overview` (`@Roles(ADMIN)`):
  - DAU/MAU (distinct request users via lightweight `UserActivity` table or refresh token usage).
  - GMV: sum of CONFIRMED `Payment.grossAmount` last 30d.
  - Take rate: sum of commission / GMV.
  - Funnel: registered → applied → accepted → booked → paid (counts per stage).
  - Tutor supply per subject.
  - Top 10 tutors by completed sessions.
  - Cohort retention: signup-month users with ≥1 booking subsequent months.
- Heavy queries cached 5 min.

New: `UserActivity { userId, lastSeenAt }` upsert via interceptor on authenticated requests. Index `lastSeenAt desc`.

---

### Commit 11 — [x] `feat(be): material view tracking, session feedback and search analytics`
**Schema:**
```prisma
model MaterialView {
  id          String   @id @default(cuid())
  materialId  String
  studentId   String
  viewedAt    DateTime @default(now())
  durationSec Int?

  material    Material       @relation(fields: [materialId], references: [id], onDelete: Cascade)
  student     StudentProfile @relation(fields: [studentId], references: [id])

  @@index([studentId, viewedAt])
  @@index([materialId])
}

model SessionFeedback {
  id                String  @id @default(cuid())
  sessionAttendeeId String  @unique
  score             Int     // 0..10
  comment           String?
  createdAt         DateTime @default(now())
}

model SearchLog {
  id          String   @id @default(cuid())
  userId      String?
  query       Json     // snapshot of filters
  resultCount Int
  createdAt   DateTime @default(now())

  @@index([createdAt])
}
```

**Endpoints:**
- `POST /materials/:id/view`: log view. Throttle 1/5min/student-material pair.
- `POST /sessions/:id/feedback`: only COMPLETED, only attendee, only once.
- `GET /admin/analytics/nps`: avg + distribution last 30d.
- `GET /admin/analytics/search-gaps`: zero-result queries grouped by `query.subject`, `query.level`. Identifies recruitment targets.
- Async logging on `tutors.search`: fire-and-forget `SearchLog.create`.

**Cron:** delete `MaterialView` and `SearchLog` rows > 90d (retention).

---

### Commit 12 — [x] `feat(be): session reminders cron, throttle and full e2e`
- `@nestjs/schedule`: hourly cron. SCHEDULED sessions starting in next 24h with `reminderSentAt = null` → mail tutor + each attendee, mark `reminderSentAt`.
- `@Throttle({ limit: 5, ttl: 3600 })` on `POST /sessions`, `POST /payments/upload-proof`, `POST /tutor/payouts`.
- e2e covering full flow:
  1. Register student + tutor (with WhatsApp).
  2. Both verify email.
  3. Tutor uploads docs, admin verifies.
  4. Tutor fills profile, sets availability + bank, publishes.
  5. Student applies with message, tutor accepts.
  6. Student books session (PRIVATE_1).
  7. Student uploads payment proof.
  8. Admin confirms payment → wallet credited.
  9. Session completes → student leaves Review + Feedback.
  10. Tutor requests payout → admin marks paid.
- Unit: wallet reconciliation (sum of ledger == balance), conflict detection edge cases (back-to-back, overlap-by-1-min, blackout overlap, attendee count vs format), idempotency replay.

---

### Commit 13 — [x] `chore(be): retention crons, openapi docs and dev tooling`
Polish + ops hygiene.

- Retention crons: clean `MaterialView`, `SearchLog` > 90d, `IdempotencyKey` > 7d, `PasswordResetToken`, `EmailVerificationToken` past expiry.
- `@nestjs/swagger`: auto-document endpoints. Mount at `/docs` in dev only.
- `scripts/seed-dev.ts`: factory functions for tutors, students, sessions, materials. Idempotent.
- `.env.example` updated with all new env vars (`MIN_PAYOUT_RUPIAH`, `REFERRAL_REWARD_*`, etc.).
- README section on local dev: migrate, seed admin, seed dev data, run.

---

## Flow Diagrams

### Flow 1 — Tutor onboarding to published

```
Tutor                    Backend                              Admin
  | POST /auth/register   |                                    |
  |---------------------->|  create User + TutorProfile        |
  |                       |  create EmailVerificationToken     |
  |                       |  mail link                         |
  | (clicks link)         |                                    |
  | POST /auth/verify-email                                    |
  |---------------------->|  emailVerifiedAt = now             |
  |                       |                                    |
  | PATCH /tutors/profile (fill fields, set bank)              |
  |---------------------->|  save                              |
  | PUT /tutors/availability                                   |
  |---------------------->|  replace slots                     |
  | POST /tutors/verification (upload docs)                    |
  |---------------------->|  status PENDING                    |
  |                       |  GET /admin/tutors/verification    |
  |                       | <----------------------------------|
  |                       |  PATCH /admin/tutors/:id/verification VERIFIED
  |                       | <----------------------------------|
  |                       |  mail tutor                        |
  | GET /tutors/me/completeness                                |
  |---------------------->|  returns 90%, missing: none        |
  | POST /tutors/publish                                       |
  |---------------------->|  publishedAt = now                 |
  |                       |  → tutor visible in search         |
```

### Flow 2 — Session booking (no Payment row yet)

```
Student                Backend (sessions)            Tutor
  | POST /sessions      |                              |
  | { tutorId, format=PRIVATE_1, mode=ONLINE,          |
  |   startsAt, endsAt, attendeeStudentIds: [self] }   |
  | Idempotency-Key: ...                               |
  |-------------------->|                              |
  |                     | tx.begin                     |
  |                     | check ACCEPTED app each attendee
  |                     | check inside AvailabilitySlot
  |                     | check no overlap with SCHEDULED sessions
  |                     | check no BlackoutDate overlap
  |                     | check attendee count == format min/max
  |                     | create Session, SessionAttendee[]
  |                     | tx.commit                    |
  |                     | sendMail(tutor, student)     |
  | < 201 created ------|                              |
  | (sessionId, attendeeIds[])                         |
  |                     |                              |
  | (status: SessionAttendee.paymentId IS NULL → unpaid)
```

### Flow 3 — Photo-first payment

```
Student              Backend (payments)              Admin              Tutor wallet
  | GET /payment-instructions                         |                    |
  |-------------------->|                             |                    |
  | < banks [...] ------|                             |                    |
  |                     |                             |                    |
  | (transfers to BCA offline)                        |                    |
  |                     |                             |                    |
  | POST /payments/preview-discount (optional)        |                    |
  |-------------------->|                             |                    |
  | < net amount -------|                             |                    |
  |                     |                             |                    |
  | POST /payments/upload-proof (multipart)           |                    |
  | { kind=SESSION, refId=attendeeId, method, promoCode?, proofImage }     |
  | Idempotency-Key: ...                              |                    |
  |-------------------->|                             |                    |
  |                     | tx.begin                                         |
  |                     | resolve amount from refId                        |
  |                     | apply credit + promo                             |
  |                     | snapshot active platform bank                    |
  |                     | upload image via upload module                   |
  |                     | create Payment(UNDER_REVIEW, proofUrl, snapshot) |
  |                     | tx.commit                                        |
  | < 201 ---------------                             |                    |
  |                     |                             |                    |
  |                     |  GET /admin/payments?status=UNDER_REVIEW         |
  |                     | <-------------------------- |                    |
  |                     | --------payload-----------> |                    |
  |                     |                             |                    |
  |                     | PATCH /admin/payments/:id/confirm                |
  |                     | <-------------------------- |                    |
  |                     | tx.begin                                         |
  |                     | Payment.status = CONFIRMED                       |
  |                     | SessionAttendee.paymentId = paymentId            |
  |                     | wallet.availableBalance += net                   |
  |                     | ledger.write(+net, PAYMENT_CONFIRMED)            |
  |                     | trigger referral reward check                    |
  |                     | tx.commit                                        |
  |                     | sendMail(student + tutor)                        |
```

### Flow 4 — Tutor payout (Pattern B)

```
Tutor                Backend (payouts)              Admin
  | GET /tutor/wallet                                |
  |-------------------->|                            |
  | < balance, ledger --|                            |
  |                     |                            |
  | POST /tutor/payouts { amount }                   |
  | Idempotency-Key: ...                             |
  |-------------------->|                            |
  |                     | tx.begin                                       
  |                     | check verified, bank set, balance, min, no pending
  |                     | snapshot bank from TutorProfile                 
  |                     | create Payout(REQUESTED)                        
  |                     | wallet -= amount                                
  |                     | ledger.write(-amount, PAYOUT_REQUESTED)         
  |                     | tx.commit                                       
  | < 201 ---------------                            |
  |                     |                            |
  |                     |  GET /admin/payouts?status=REQUESTED
  |                     | <------------------------- |
  |                     | --------payload----------> |
  |                     |                            |
  |                     |  (admin transfers manually via mobile banking)
  |                     |                            |
  |                     |  POST /admin/payouts/:id/mark-paid (proof img)
  |                     | <------------------------- |
  |                     | Payout.status = PAID, paidAt, proofUrl
  |                     | ledger.write(0, PAYOUT_PAID) audit row
  | < mail notif --------                            |
```

Rejection path: refund wallet balance, ledger credit, status REJECTED.

### Flow 5 — Subscription activation

```
Student              Backend                          Admin
  | POST /subscription/request { tier }              |
  |-------------------->|                            |
  | < refId ------------|                            |
  |                     |                            |
  | (transfers offline) |                            |
  |                     |                            |
  | POST /payments/upload-proof                      |
  | { kind=SUBSCRIPTION, refId, method, proofImage } |
  |-------------------->|                            |
  |                     | create Payment(UNDER_REVIEW)
  | < 201 ---------------                            |
  |                     |                            |
  |                     |  PATCH /admin/payments/:id/confirm
  |                     | <------------------------- |
  |                     | tx.begin                   
  |                     | upsert Subscription(tier, expiresAt)
  |                     | tx.commit                  
  | < mail confirm -----|                            |
```

### Flow 6 — Referral reward grant

```
Inviter (Tutor A)    Backend                          Admin                Referred (Student B)
  | (gives code to B) |                              |                       |
  |                   |                              |                       |
  |                   |  POST /auth/register { referralCode: A.code }        |
  |                   | <-----------------------------------------|----------|
  |                   |  set B.referredById = A.userId            |          |
  |                   |                              |                       |
  |                   |                              | (B books + pays first SESSION)
  |                   |                              | confirm payment       |
  |                   |  on confirm: create ReferralReward(PENDING)          |
  |                   |                              |                       |
  |                   |  POST /admin/referrals/:id/grant                     |
  |                   | <----------------------------|                       |
  |                   |  TutorWallet(A) += rewardAmount                      |
  |                   |  StudentCredit(B).balance += rewardAmount            |
  |                   |  ReferralReward.status = GRANTED                     |
  | < mail notif -----|                              |---------- mail notif--|
```

---

## Summary Table

| Commit | Theme | Tier |
|--------|-------|------|
| 1 | profiles, materials, application message, admin bootstrap | yes |
| 2 | email verification and password reset | yes |
| 3 | tutor verification, completeness and publish gate | yes |
| 4 | sessions, attendees, availability, booking and drop legacy | yes |
| 5 | photo-first payment, platform bank and idempotency | yes |
| 6 | tutor wallet, ledger and payouts | yes |
| 7 | subscription, featured, promo codes and student credit | yes |
| 8 | referral program | yes |
| 9 | search filters, leaderboard, rate suggestion and materials filters | yes |
| 10 | dashboards and analytics endpoints | yes |
| 11 | view tracking, feedback NPS and search analytics | yes |
| 12 | reminders cron, throttle and full e2e | yes |
| 13 | retention crons, OpenAPI docs and dev tooling | recommended |

13 commits. All meaningful, sized for review (~half day each), self-contained.

## Per-Commit Test Hook
```bash
cd backend
pnpm run lint
pnpm run test
pnpm run test:e2e
npx prisma migrate dev
```

## Cross-cutting Implementation Notes

- **Money:** `Int` rupiah everywhere. No `Float`.
- **Snapshots:** Payment.receivedToBank, Payout.bank trio, Session.pricePerSeat. Survive upstream edits.
- **Wallet reconcilable:** `sum(WalletLedger.delta where tutorId=X) == TutorWallet.availableBalance`. Test invariant.
- **Idempotency:** required on every state-changing POST. Stored 7d.
- **Transactions:** any multi-step write (apply, accept, book, confirm payment, payout request, payout reject) uses `prisma.$transaction`.
- **Soak order:** Commits 4 → 5 → 6 → 7 stack; ship one then next. Drop legacy fields in commit 4 only after migration succeeds.
- **Email verification gates payments and bookings.** Reads still work.
- **`Session.meetingUrl`** is plain text. Tutor pastes Zoom/Meet manually until video integration.
- **Verification gates publish AND payout.** Two gates, same status.

## Out of Scope (future plans)

- Trust & safety (block, report, dispute, anti-fraud)
- Recurring bookings, blackout exceptions, calendar sync
- Account deletion, data export, TOS log
- Background job queue (BullMQ)
- Mobile app, push notifications

## Future Third-Party Integrations (recommended wire order)

1. Sentry — error tracking
2. Resend — email transport
3. Cloudflare R2 — object storage
4. Xendit — payment gateway (replaces manual photo flow)
5. Xendit Disbursement — automated payouts (replaces Pattern B manual)
6. Google OAuth — login
7. Daily.co or Google Meet API — video class
8. Pusher or Socket.io — chat and live notifications
9. FCM — push notifications
10. Twilio or Verihubs — SMS verification
