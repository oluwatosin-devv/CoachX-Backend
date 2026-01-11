# Like Schema (`likes`)

## Purpose

This document defines the structure, responsibility, and constraints of the **Like** schema in the CoachX backend.

The `likes` collection represents **user expressions of appreciation** on creator posts. Likes are a lightweight engagement signal used to improve content discovery and user interaction.

A Like always belongs to a **Post** and is created by a **User**.

---

## 1. Responsibility of the Like Schema

The Like schema is responsible for:

* Recording that a user liked a post
* Preventing duplicate likes from the same user
* Supporting fast engagement checks (liked / not liked)
* Powering engagement counters on posts

It is **not** responsible for:

* Storing post or user metadata
* Calculating engagement analytics
* Handling notifications
* Tracking reactions beyond simple likes

Any advanced engagement logic must live outside this schema.

---

## 2. Core Fields

| Field Name | Type                 | Required | Description                     |
| ---------- | -------------------- | -------- | ------------------------------- |
| _id        | ObjectId             | Yes      | Primary identifier for the like |
| postId     | ObjectId (ref: Post) | Yes      | Post that was liked             |
| userId     | ObjectId (ref: User) | Yes      | User who liked the post         |
| createdAt  | Date                 | Yes      | When the like was created       |

---

## 3. Uniqueness Rules

A user can like a post **only once**.

This rule is enforced by:

* A compound unique index on (`postId`, `userId`)

Duplicate likes must never be allowed at application or database level.

---

## 4. Relationships

```
Post (one)
 └─ Likes (many)

User (one)
 └─ Likes (many)
```

Likes do not reference CreatorProfile directly.

---

## 5. Access Control Rules

* Only authenticated users can like posts
* Users can unlike posts they previously liked
* Inactive or banned users cannot like content
* Admins do not manually create likes

Access checks are enforced at API level.

---

## 6. Indexing Strategy

Recommended indexes:

* Compound unique index on (`postId`, `userId`)
* Index on `userId` (user activity)
* Index on `postId` (post engagement)

These support fast checks and aggregation queries.

---

## 7. Stored vs Derived Data

Stored:

* Like ownership (userId, postId)
* Timestamp of engagement

Derived (must NOT be stored here):

* Total likes count (cached on Post)
* Engagement rankings
* User reputation scores

Derived values must be calculated dynamically or cached elsewhere.

---

## 8. Validation Rules

* `postId` must reference an existing post
* `userId` must reference an active user
* Duplicate likes are rejected

Validation is enforced at both API and database levels.

---

## 9. Lifecycle Notes

* Creating a like increments `likesCount` on the Post
* Removing a like decrements `likesCount`
* Hard deletion is acceptable (no audit requirement)

Counter updates must be atomic to prevent race conditions.

---

## 10. Rate Limiting & Abuse Prevention

Recommended safeguards:

* Rate-limit like/unlike actions per user
* Prevent rapid toggle abuse
* Log suspicious engagement patterns

These rules protect feed integrity at scale.

---

## 11. Next Steps

* [ ] Finalise Subscription schema
* [ ] Implement engagement APIs
* [ ] Connect likes to discovery ranking logic

---

## 12. Notes

The Like schema is intentionally **minimal and strict**.

By keeping likes simple, the platform can scale engagement without increasing write complexity or storage overhead.
