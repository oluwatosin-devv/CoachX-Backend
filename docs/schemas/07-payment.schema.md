# Payment Schema (`payments`)

## Purpose

This document defines the structure, responsibility, and constraints of the **Payment** schema in the CoachX backend.

The `payments` collection represents the **financial source of truth** for all monetary transactions on the platform. Every successful or failed charge attempt must be recorded here for auditability, reconciliation, and dispute handling.

This schema is intentionally **append-only and immutable**.

---

## 1. Responsibility of the Payment Schema

The Payment schema is responsible for:

* Recording payment attempts and outcomes
* Linking payments to subscriptions
* Storing provider transaction references
* Supporting audits, refunds, and disputes

It is **not** responsible for:

* Granting content access
* Calculating creator earnings
* Managing subscription lifecycle
* Storing pricing rules

Access control and revenue calculations depend on this schema but do not live inside it.

---

## 2. Core Fields

| Field Name        | Type                           | Required | Description                        |
| ----------------- | ------------------------------ | -------- | ---------------------------------- |
| _id               | ObjectId                       | Yes      | Primary identifier for the payment |
| userId            | ObjectId (ref: User)           | Yes      | User who made the payment          |
| creatorId         | ObjectId (ref: CreatorProfile) | Yes      | Creator receiving payment          |
| subscriptionId    | ObjectId (ref: Subscription)   | No       | Related subscription               |
| amount            | Number                         | Yes      | Charged amount (minor units)       |
| currency          | String                         | Yes      | ISO currency code (e.g. NGN, USD)  |
| status            | Enum                           | Yes      | Payment state                      |
| provider          | Enum                           | Yes      | Payment provider                   |
| providerReference | String                         | Yes      | External transaction reference     |
| createdAt         | Date                           | Yes      | Payment creation timestamp         |
| processedAt       | Date                           | No       | When provider confirmed result     |

---

## 3. Payment Status States

Allowed values:

* pending
* successful
* failed
* refunded
* disputed

### State Rules

* `pending` indicates awaiting provider confirmation
* `successful` is final and immutable
* `failed` indicates unsuccessful charge
* `refunded` references a prior successful payment
* `disputed` indicates chargeback or user dispute

Once a payment is `successful`, it must never be modified.

---

## 4. Payment Providers

Supported providers (example):

* stripe
* paystack
* flutterwave

Rules:

* Provider values must be controlled enums
* Provider-specific metadata must be stored separately
* Provider secrets are never stored

---

## 5. Relationships

```
User (one)
 └─ Payments (many)

CreatorProfile (one)
 └─ Payments (many)

Subscription (one)
 └─ Payments (many)
```

Payments may exist without subscriptions (e.g. one-time purchases).

---

## 6. Uniqueness & Idempotency

To prevent duplicate charges:

* `providerReference` must be unique
* Payment creation must be idempotent

Idempotency is enforced at service level using provider references.

---

## 7. Indexing Strategy

Recommended indexes:

* Unique index on `providerReference`
* Index on `userId`
* Index on `creatorId`
* Index on `subscriptionId`
* Index on `status`
* Index on `createdAt`

These support reconciliation, audits, and support queries.

---

## 8. Stored vs Derived Data

Stored:

* Transaction metadata
* Provider identifiers
* Final payment state

Derived (must NOT be stored here):

* Creator earnings
* Platform revenue
* Refund totals
* Subscription access state

Derived data must be computed from payment history.

---

## 9. Validation Rules

* `amount` must be positive
* `currency` must be valid ISO code
* `providerReference` is required
* `status` must be a valid enum
* `subscriptionId` must reference existing subscription if present

Validation is enforced strictly.

---

## 10. Refunds & Disputes

Refund handling rules:

* Refunds create new records with `status: refunded`
* Original successful payment remains untouched
* Refund records reference original providerReference

Disputes:

* Mark payment as `disputed`
* No deletion or mutation allowed
* Resolution updates status via new events

---

## 11. Lifecycle Notes

* Payment records are created before provider confirmation
* Provider webhooks update `status` and `processedAt`
* Failed payments do not grant access
* Successful payments trigger subscription activation

Payment processing must be webhook-driven, not client-trusted.

---

## 12. Next Steps

* [ ] Implement provider webhook handlers
* [ ] Build idempotent payment services
* [ ] Connect payments to subscription activation
* [ ] Add financial audit tooling

---

## 13. Notes

The Payment schema is the **financial ledger** of the platform.

If data here is wrong, everything else is wrong. Treat it as immutable, auditable, and sacred.
