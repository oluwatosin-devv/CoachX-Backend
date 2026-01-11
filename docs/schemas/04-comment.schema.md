# Comment Schema (`comments`)

## Purpose

This document defines the structure, responsibility, and constraints of the **Comment** schema in the CoachX backend.

The `comments` collection represents **user-generated responses under creator posts**. Comments enable community interaction while maintaining clear ownership, moderation, and access rules.

A Comment always belongs to a **Post** and is authored by a **User**.

---

## 1. Responsibility of the Comment Schema

The Comment schema is responsible for:

* Storing textual responses under posts
* Linking comments to posts and authors
* Supporting moderation (reporting, removal)
* Enabling threaded or flat discussions (MVP: flat)

It is **not** responsible for:

* Calculating engagement analytics
* Managing notifications
* Enforcing subscription payments
* Storing post or user metadata

Any analytics, notifications, or access checks are handled elsewhere.

---

## 2. Core Fields

| Field Name | Type                 | Required | Description                        |
| ---------- | -------------------- | -------- | ---------------------------------- |
| _id        | ObjectId             | Yes      | Primary identifier for the comment |
| postId     | ObjectId (ref: Post) | Yes      | Post this comment belongs to       |
| authorId   | ObjectId (ref: User) | Yes      | User who authored the comment      |
| content    | String               | Yes      | Comment text content               |
| createdAt  | Date                 | Yes      | When the comment was created       |
| updatedAt  | Date                 | No       | When the comment was last edited   |

---

## 3. Moderation Fields

| Field Name    | Type    | Required | Description              |
| ------------- | ------- | -------- | ------------------------ |
| isRemoved     | Boolean | Yes      | Soft-delete flag         |
| removedAt     | Date    | No       | When comment was removed |
| removalReason | String  | No       | Optional admin reason    |
| isReported    | Boolean | Yes      | Flag indicating reports  |

### Notes

* Removed comments are hidden from users but retained for audit
* Reports trigger admin review workflows

---

## 4. Content Rules

* Content must be plain text only (no HTML)
* Minimum length: 1 character
* Maximum length: 1,000 characters
* Links may be allowed but sanitised

All content is sanitised server-side to prevent XSS.

---

## 5. Relationships

```
Post (one)
 └─ Comments (many)

User (one)
 └─ Comments (many)
```

Comments do not reference CreatorProfile directly.

---

## 6. Access Control Rules

* Only authenticated users can create comments
* Users can edit or delete their own comments
* Admins can remove any comment
* Banned or inactive users cannot comment

Subscription checks are enforced at post-access level, not comment level.

---

## 7. Indexing Strategy

Recommended indexes:

* Index on `postId`
* Index on `authorId`
* Compound index on (`postId`, `createdAt`)
* Index on `isRemoved`

These support pagination, moderation, and user activity queries.

---

## 8. Stored vs Derived Data

Stored:

* Comment content
* Ownership references
* Moderation state

Derived (must NOT be stored here):

* Comment counts (cached on Post)
* Engagement trends
* User reputation metrics

---

## 9. Validation Rules

* `postId` must reference an existing post
* `authorId` must reference an active user
* Content length enforced
* Removed comments cannot be edited

---

## 10. Lifecycle Notes

* Creating a comment increments `commentsCount` on the Post
* Editing a comment updates `updatedAt`
* Removing a comment decrements `commentsCount`
* Hard deletion is admin-only and rare

All counter updates must be transaction-safe.

---

## 11. Rate Limiting & Abuse Prevention

Recommended safeguards:

* Per-user comment rate limits
* Duplicate content detection
* Temporary comment bans for abuse

These rules protect platform health at scale.

---

## 12. Next Steps

* [ ] Design Like schema
* [ ] Implement comment moderation APIs
* [ ] Add pagination and sorting rules
* [ ] Connect comments to notification system (future)

---

## 13. Notes

The Comment schema is intentionally **simple and defensive**.

Keeping comments lean prevents performance degradation and moderation complexity as usage grows.
