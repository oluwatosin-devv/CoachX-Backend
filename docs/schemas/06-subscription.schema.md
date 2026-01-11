# Subscription Schema (`subscriptions`)

## Purpose

This document defines the structure, responsibility, and constraints of the **Subscription** schema in the CoachX backend.

The `subscriptions` collection represents **access relationships** between users and creators. A subscription determines **what content a user can access**, **under what plan**, and **for how long**.

This schema is the backbone of **paid access control** and must be correct, auditable, and predictable.

---

## 1. Responsibility of the Subscription Schema

The Subscription schema is responsible for:

* Granting and revoking access to creator content
* Tracking subscription lifecycle state
* Linking users to creators through plans
* Acting as the source of truth for access checks

It is **not** responsible for:

* Payment processing
* Financial reconciliation
* Content analytics
* Creator earnings calculations

Financial data lives in the Payment schema.

---

## 2. Core Fields

| Field Name | Type                           | Required | Description                               |
| ---------- | ------------------------------ | -------- | ----------------------------------------- |
| _id        | ObjectId                       | Yes      | Primary identifier for the subscription   |
| userId     | ObjectId (ref: User)           | Yes      | Subscriber                                |
| creatorId  | ObjectId (ref: CreatorProfile) | Yes      | Creator being subscribed to               |
| plan       | Enum                           | Yes      | Subscription plan identifier              |
| status     | Enum                           | Yes      | Subscription state                        |
| startDate  | Date                           | Yes      | Subscription start time                   |
| endDate    | Date                           | No       | Subscription end time                     |
| autoRenew  | Boolean                        | Yes      | Whether subscription renews automatically |
| createdAt  | Date                           | Yes      | Record creation timestamp                 |
| updatedAt  | Date                           | No       | Last update timestamp                     |

---

## 3. Subscription Plans

Plans define access level and pricing logic.

Examples:

* basic
* premium
* vip

Rules:

* Plan values must be controlled enums
* Pricing is not stored here
* Plan logic is enforced at access layer

Plan configuration should live in a dedicated constants or config module.

---

## 4. Subscription Status States

Allowed values:

* active
* expired
* cancelled
* paused

### State Rules

* `active` grants content access
* `expired` denies access after endDate
* `cancelled` denies access immediately
* `paused` temporarily denies access without ending

Status transitions must be explicit and validated.

---

## 5. Relationships

```
User (one)
 └─ Subscriptions (many)

CreatorProfile (one)
 └─ Subscriptions (many)
```

Subscriptions do not reference Posts directly.

Access checks resolve as:

User → Subscription → Creator → Post

---

## 6. Uniqueness Rules

A user can have **only one active subscription per creator**.

Enforced by:

* Compound unique index on (`userId`, `creatorId`, `status: active`)

Historical subscriptions remain preserved.

---

## 7. Indexing Strategy

Recommended indexes:

* Compound index on (`userId`, `creatorId`)
* Index on `status`
* Index on `endDate` (expiry checks)
* Index on `createdAt`

These support access checks, cleanup jobs, and admin queries.

---

## 8. Stored vs Derived Data

Stored:

* Subscription ownership
* Plan and status
* Lifecycle timestamps

Derived (must NOT be stored here):

* Remaining days
* Revenue totals
* Creator earnings
* Subscription counts

Derived values must be computed dynamically.

---

## 9. Validation Rules

* `userId` must reference an active user
* `creatorId` must reference a valid creator
* `startDate` must be before `endDate`
* `status` must be a valid enum
* Only one active subscription per creator

Validation is enforced at schema and service layers.

---

## 10. Lifecycle Notes

* Creating a subscription sets status to `active`
* Cancelling sets status to `cancelled` and disables autoRenew
* Expiration is handled by background jobs
* Renewals extend `endDate` and keep history intact

No subscription record should be overwritten or reused.

---

## 11. Access Control Rules

Content access checks must:

1. Resolve subscription by `userId` and `creatorId`
2. Confirm `status === active`
3. Validate current time < `endDate` (if present)

If any check fails, access is denied.

---

## 12. Next Steps

* [ ] Design Payment schema
* [ ] Implement access middleware
* [ ] Add subscription renewal jobs
* [ ] Define plan configuration model

---

## 13. Notes

The Subscription schema must remain **strict and conservative**.

Any ambiguity here will result in broken access control and revenue loss.
