# CoachX Backend Documentation (MVP)

## 1. Purpose of This Document

This document serves as the **single source of truth** for the CoachX backend system. It is written to:

* Give clear technical direction to current and future backend engineers.
* Ensure everyone understands *what we are building*, *why we are building it*, and *how it should scale*.
* Prevent ad-hoc development and architectural drift.
* Support long-term maintainability, security, and performance for a production-grade system.

This is **not** a throwaway MVP. Every decision documented here assumes real users, real payments, and real scale.

---

## 2. Project Scope (MVP Only)

CoachX MVP focuses on **creator content monetisation** and **community interaction**, without advanced AI or heavy analytics.

### Included in MVP

* Authentication and authorisation (JWT-based)
* User and Creator accounts
* Creator content posting (free and paid)
* Subscriptions and payments (Paystack / Flutterwave)
* Discover feed
* Likes and comments
* Admin moderation

### Explicitly Excluded from MVP

* AI Calorie Scanner
* Smart Meal Planner
* Gamification systems
* Advanced analytics
* Automated creator payouts

These will be introduced in later phases.

---

## 3. High-Level Backend Architecture

### 3.1 Technology Stack

* **Runtime:** Node.js (LTS)
* **Framework:** Express.js
* **Database:** MongoDB (Mongoose ODM)
* **Authentication:** JWT (Access + Refresh Tokens)
* **Payments:** Paystack / Flutterwave
* **Storage:** Cloud storage (S3-compatible)
* **Deployment:** Docker + Cloud provider (AWS / GCP / Render)

### 3.2 Architectural Principles

* Modular, domain-driven folder structure
* Stateless APIs
* Strong separation of concerns
* Defensive programming and validation
* Horizontal scalability

---

## 4. Core Domains (Backend Modules)

The backend is divided into clear domains. Each domain owns its logic, routes, services, and models.

### Domains

1. Auth & Identity
2. Users
3. Creators
4. Posts
5. Subscriptions
6. Payments
7. Community (Likes, Comments)
8. Admin

---

## 5. Authentication & Authorisation

### 5.1 Authentication Strategy

* JWT-based authentication
* Short-lived access tokens
* Optional refresh tokens (Phase 1.5)
* HTTP-only cookies for web clients

### 5.2 Roles

* `user` – regular subscriber
* `creator` – content creator
* `admin` – platform administrator

Role-based access control is enforced via middleware.

---

## 6. User & Creator Model Design

### 6.1 User Model (Reviewed)

The provided user schema is **largely correct** and production-ready, with a few important notes.

#### What Is Good

* Secure password hashing with bcrypt
* Email validation
* Password reset and email verification tokens
* Role-based access
* Soft deactivation (`is_active`)

#### Improvements Recommended

1. **Remove `passwordConfirm` from persistence logic**

   * It should only exist at validation time, not schema level storage.

2. **Index email explicitly**

   * Ensures performance at scale.

3. **Normalise naming conventions**

   * Use `isActive`, `isVerified` instead of snake_case.

4. **Fitness goal as enum**

   * Prevents invalid values.

#### Final User Schema Intent

The User model represents *identity*, not behaviour. Domain-specific data (creator stats, subscriptions) should live elsewhere.

---

## 7. Creator Profile Domain

Creators extend users via a separate collection.

### Responsibilities

* Bio and specialisation
* Subscription price
* Creator verification status
* Earnings summary (derived)

### Relationship

* One-to-one relationship with User
* Referenced using `userId`

---

## 8. Content (Posts)

### Post Types

* Image
* Video
* Text
* Workout guide

### Visibility

* Free
* Subscriber-only

### Backend Responsibilities

* Validate ownership
* Enforce subscription access
* Moderate content

---

## 9. Subscriptions & Payments

### Subscription Logic

* One active subscription per creator per user
* Time-based access control
* Manual creator payouts (admin managed)

### Payment Flow

1. User initiates subscription
2. Payment gateway callback verifies transaction
3. Subscription record is created
4. Access is granted

All payment verification is server-side only.

---

## 10. Community Features

### Included

* Likes
* Comments

### Excluded

* Group challenges
* Leaderboards

Community actions are rate-limited to prevent abuse.

---

## 11. Admin Capabilities

Admins can:

* Suspend users or creators
* Approve or remove posts
* View platform metrics
* Manually manage payouts

Admin routes are isolated and protected.

---

## 12. Folder Structure (Recommended)

```
src/
 ├── config/
 ├── modules/
 │   ├── auth/
 │   ├── users/
 │   ├── creators/
 │   ├── posts/
 │   ├── subscriptions/
 │   ├── payments/
 │   ├── comments/
 │   └── admin/
 ├── middlewares/
 ├── utils/
 ├── app.js
 └── server.js
```

---

## 13. Scalability Considerations

* Index frequently queried fields
* Paginate all list endpoints
* Avoid population-heavy queries
* Use background jobs for emails and webhooks

---

## 14. Security Standards

* Never expose sensitive fields
* Validate all inputs
* Use HTTPS everywhere
* Store secrets in environment variables
* Audit payment callbacks

---

## 15. Documentation Strategy Going Forward

This repository should contain:

1. **README.md** – project overview
2. **ARCHITECTURE.md** – system design
3. **API.md** – endpoints
4. **SCHEMAS.md** – database models
5. **CONTRIBUTING.md** – team rules

No feature is built without documentation.

---

## 16. Final Note

This backend is designed to survive real-world traffic, not demos. Every teammate should understand this document before writing code.

Build deliberately. Scale responsibly.
