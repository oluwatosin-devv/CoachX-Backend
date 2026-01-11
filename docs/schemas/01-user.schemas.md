# User Schema (`users`)

## Purpose

This document defines the structure, responsibility, and constraints of the **User** schema in the CoachX backend.

The `users` collection represents **application-level identity**. Every person on CoachX exists as a User first, regardless of whether they later become a creator or remain a regular subscriber.

This schema is the **source of truth for identity, access, and account state**.

---

## 1. Responsibility of the User Schema

The User schema is responsible for:

* Identifying a person within the CoachX platform
* Handling authentication credentials
* Managing roles and access levels
* Storing basic profile information
* Controlling account state (active, verified)

It is **not** responsible for:

* Creator earnings or monetisation data
* Subscriptions or payments
* Posts, comments, or likes
* Analytics or derived metrics

Any data that grows with usage must live in related collections.

---

## 2. Core Fields

| Field Name | Type     | Required | Description                       |
| ---------- | -------- | -------- | --------------------------------- |
| _id        | ObjectId | Yes      | Primary identifier for the user   |
| fullName   | String   | Yes      | User’s display or real name       |
| email      | String   | Yes      | Unique login identifier           |
| password   | String   | Yes      | Hashed password (never returned)  |
| role       | Enum     | Yes      | Access role: user, creator, admin |
| createdAt  | Date     | Yes      | Account creation timestamp        |

---

## 3. Authentication & Security Fields

| Field Name                 | Type   | Required | Description                 |
| -------------------------- | ------ | -------- | --------------------------- |
| passwordChangedAt          | Date   | No       | Used to invalidate old JWTs |
| passwordResetToken         | String | No       | Hashed reset token          |
| passwordResetExpires       | Date   | No       | Reset token expiry          |
| emailVerificationToken     | String | No       | Hashed verification token   |
| emailVerificationExpiresIn | Date   | No       | Verification token expiry   |

### Notes

* Passwords are hashed using bcrypt before persistence
* Raw reset or verification tokens are never stored
* All token verification happens server-side

---

## 4. Profile Fields

| Field Name   | Type          | Required | Description                |
| ------------ | ------------- | -------- | -------------------------- |
| profilePhoto | String        | No       | Profile avatar URL         |
| bio          | String        | No       | Short user bio             |
| gender       | String        | No       | Optional demographic field |
| fitnessGoal  | Array<String> | No       | User fitness goals         |

### Fitness Goals

Fitness goals must be controlled values, for example:

* weight_loss
* muscle_gain
* maintenance

Free-form strings are discouraged to maintain data consistency.

---

## 5. Account State Fields

| Field Name | Type    | Required | Description               |
| ---------- | ------- | -------- | ------------------------- |
| isActive   | Boolean | Yes      | Soft-delete flag          |
| isVerified | Boolean | Yes      | Email verification status |

### Rules

* Inactive users cannot authenticate
* Unverified users have limited access
* Deactivation does not delete data

---

## 6. Validation Rules

* Email must be unique and valid
* Password minimum length: 8 characters
* Bio length: 10–150 characters
* Role must be one of predefined values

Validation is enforced at both schema and request level.

---

## 7. Relationships

```
User (one)
 └─ CreatorProfile (one, optional)
```

The User schema does not directly reference other domain data.

All downstream entities must reference `userId`.

---

## 8. Indexing Strategy

Recommended indexes:

* Unique index on `email`
* Index on `role` (admin queries)
* Index on `createdAt`

These indexes support authentication, filtering, and administration at scale.

---

## 9. Stored vs Derived Data

Stored:

* Identity information
* Authentication state
* Profile metadata

Derived (must NOT be stored here):

* Subscription count
* Earnings
* Engagement metrics
* Activity streaks

Derived data must be calculated dynamically or stored in dedicated collections.

---

## 10. Lifecycle Notes

* User creation requires email verification
* Password changes update `passwordChangedAt`
* Soft deletion preserves referential integrity
* Hard deletion is an admin-only operation

---

## 11. Next Steps

* [ ] Finalise CreatorProfile schema
* [ ] Define Subscription schema
* [ ] Design Payment schema
* [ ] Map API endpoints that reference User

---

## 12. Notes

The User schema should remain **small, stable, and boring**.

If a field does not belong to identity or access control, it does not belong here.
