# Creator Profile Schema (`creator_profiles`)

## Purpose

This document defines the structure, responsibility, and constraints of the **CreatorProfile** schema in the CoachX backend.

The `creator_profiles` collection represents a **fitness creator’s public and monetisation profile**. It extends a User account but does not replace it.

Every creator is always a User first. This schema exists to separate **identity and access control** from **creator-specific business logic**.

---

## 1. Responsibility of the CreatorProfile Schema

The CreatorProfile schema is responsible for:

* Representing a user as a fitness creator
* Storing creator-specific profile information
* Managing subscription pricing
* Tracking creator verification status
* Acting as the root owner of creator-owned content

It is **not** responsible for:

* Authentication or login credentials
* Handling payments or payouts
* Storing posts themselves
* Computing analytics or revenue summaries

Anything related to money movement or calculations must live in dedicated schemas.

---

## 2. Core Fields

| Field Name        | Type                 | Required | Description                                          |
| ----------------- | -------------------- | -------- | ---------------------------------------------------- |
| _id               | ObjectId             | Yes      | Primary identifier for the creator profile           |
| userId            | ObjectId (ref: User) | Yes      | Owner of this creator profile                        |
| displayName       | String               | Yes      | Public creator name (may differ from user full name) |
| specialization    | Array<String>        | Yes      | Fitness focus areas (e.g. yoga, strength)            |
| subscriptionPrice | Number               | Yes      | Monthly subscription price                           |
| createdAt         | Date                 | Yes      | When the creator profile was created                 |

---

## 3. Creator Status & Verification Fields

| Field Name | Type    | Required | Description                           |
| ---------- | ------- | -------- | ------------------------------------- |
| isVerified | Boolean | Yes      | Creator verification status           |
| verifiedAt | Date    | No       | When verification was granted         |
| isActive   | Boolean | Yes      | Whether the creator profile is active |

### Rules

* Verification is optional for MVP
* Unverified creators may still post content
* Inactive creators cannot receive new subscribers

---

## 4. Public Profile Fields

| Field Name   | Type   | Required | Description                                   |
| ------------ | ------ | -------- | --------------------------------------------- |
| bio          | String | No       | Creator bio shown publicly                    |
| profilePhoto | String | No       | Creator avatar                                |
| bannerImage  | String | No       | Creator profile banner                        |
| socialLinks  | Object | No       | External social links (Instagram, X, YouTube) |

### Notes

* Bio should be short and purpose-driven
* Social links are optional and validated per platform

---

## 5. Subscription Configuration

| Field Name           | Type   | Required | Description                             |
| -------------------- | ------ | -------- | --------------------------------------- |
| subscriptionCurrency | String | Yes      | Currency code (e.g. NGN)                |
| subscriptionInterval | Enum   | Yes      | Billing interval (monthly only for MVP) |

### Rules

* Only one subscription tier is allowed in MVP
* Price changes affect new subscriptions only
* Existing subscribers keep previous pricing until renewal

---

## 6. Relationships

```
User (one)
 └─ CreatorProfile (one)
     ├─ Posts (many)
     ├─ Subscriptions (many)
     └─ Payments (many, indirect)
```

All creator-owned entities must reference `creatorId`.

---

## 7. Indexing Strategy

Recommended indexes:

* Unique index on `userId`
* Index on `subscriptionPrice`
* Index on `isVerified`
* Index on `createdAt`

These support discovery, filtering, and admin operations.

---

## 8. Stored vs Derived Data

Stored:

* Public profile metadata
* Subscription configuration
* Verification status

Derived (must NOT be stored here):

* Total earnings
* Subscriber count
* Engagement metrics
* Revenue trends

Derived values must be calculated dynamically or cached elsewhere.

---

## 9. Validation Rules

* `userId` must reference an existing User
* One CreatorProfile per User
* Subscription price must be greater than zero
* Display name length: 3–50 characters
* Specialisation values must be controlled

---

## 10. Lifecycle Notes

* Creating a CreatorProfile upgrades a User’s role to `creator`
* Deactivating a profile hides creator content from discovery
* Deletion does not remove the underlying User account
* Verification is handled by admin action

---

## 11. Access Control Rules

* Only the owning User can edit their CreatorProfile
* Admins can verify, suspend, or remove profiles
* Regular users have read-only access

---

## 12. Next Steps

* [ ] Design Post schema
* [ ] Define Subscription schema
* [ ] Connect CreatorProfile to Discover feed
* [ ] Implement creator onboarding flow

---

## 13. Notes

The CreatorProfile schema defines **who can monetise content**, not how money flows.

Keeping this schema lean protects the system from financial and analytical complexity leaking into identity data.
