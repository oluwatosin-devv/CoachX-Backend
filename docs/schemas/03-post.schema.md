# Post Schema (`posts`)

## Purpose

This document defines the structure, responsibility, and constraints of the **Post** schema in the CoachX backend.

The `posts` collection represents **creator-generated content** published on the platform. Posts are the primary medium through which creators share value and subscribers consume content.

A Post always belongs to a **CreatorProfile**, never directly to a User.

---

## 1. Responsibility of the Post Schema

The Post schema is responsible for:

* Storing creator-generated content
* Defining content visibility (free vs subscriber-only)
* Supporting discovery and feeds
* Enabling community interaction (likes and comments)
* Supporting moderation workflows

It is **not** responsible for:

* Managing subscriptions or access payments
* Storing media files themselves
* Tracking analytics or engagement summaries
* Handling creator verification or payouts

All financial and analytical concerns must live outside this schema.

---

## 2. Core Fields

| Field Name | Type                           | Required | Description                     |
| ---------- | ------------------------------ | -------- | ------------------------------- |
| _id        | ObjectId                       | Yes      | Primary identifier for the post |
| creatorId  | ObjectId (ref: CreatorProfile) | Yes      | Owner of the post               |
| type       | Enum                           | Yes      | Content type                    |
| visibility | Enum                           | Yes      | Access level of the post        |
| createdAt  | Date                           | Yes      | When the post was published     |
| updatedAt  | Date                           | No       | When the post was last updated  |

---

## 3. Content Fields

| Field Name  | Type   | Required | Description                       |
| ----------- | ------ | -------- | --------------------------------- |
| title       | String | No       | Optional post title               |
| caption     | String | No       | Post caption or description       |
| mediaUrl    | String | No       | Image or video URL                |
| textContent | String | No       | Long-form text or article content |

### Content Rules

* At least one of `mediaUrl` or `textContent` must be present
* Media files are stored externally (e.g. S3 or CDN)
* Post size limits are enforced at upload level

---

## 4. Post Types

Allowed values for `type`:

* image
* video
* text
* workout

Type determines validation rules and frontend rendering behaviour.

---

## 5. Visibility & Access Control

| Visibility       | Description                           |
| ---------------- | ------------------------------------- |
| free             | Visible to all users                  |
| subscribers_only | Accessible only to active subscribers |

### Rules

* Visibility is immutable after publishing
* Access checks are enforced server-side
* Non-subscribers may preview locked content metadata only

---

## 6. Moderation Fields

| Field Name | Type    | Required | Description            |
| ---------- | ------- | -------- | ---------------------- |
| isApproved | Boolean | Yes      | Admin approval status  |
| approvedAt | Date    | No       | When post was approved |
| isReported | Boolean | No       | Flagged for review     |

### Notes

* Posts may be auto-approved in MVP
* Admins can remove or suspend posts
* Removed posts are soft-deleted

---

## 7. Engagement Counters

| Field Name    | Type   | Required | Description               |
| ------------- | ------ | -------- | ------------------------- |
| likesCount    | Number | Yes      | Cached number of likes    |
| commentsCount | Number | Yes      | Cached number of comments |

### Important

These counters are **denormalised** for performance.

Source of truth remains the Like and Comment collections.

---

## 8. Relationships

```
CreatorProfile (one)
 └─ Posts (many)
     ├─ Comments (many)
     └─ Likes (many)
```

Posts do not directly reference Users for engagement.

---

## 9. Indexing Strategy

Recommended indexes:

* Index on `creatorId`
* Index on `createdAt`
* Compound index on (`visibility`, `createdAt`)
* Index on `isApproved`

These support feeds, discovery, and moderation.

---

## 10. Stored vs Derived Data

Stored:

* Post content and metadata
* Visibility rules
* Cached engagement counts

Derived (must NOT be stored here):

* Subscriber lists
* Revenue attribution
* Engagement trends

---

## 11. Validation Rules

* Creator must exist and be active
* Content must not be empty
* Caption length: max 2,000 characters
* Text content length: max 10,000 characters
* Media URLs must be valid

---

## 12. Lifecycle Notes

* Post creation requires an active CreatorProfile
* Editing a post updates `updatedAt`
* Deleting a post soft-deletes it
* Moderation actions are logged by admin

---

## 13. Access Control Rules

* Only the owning creator can create or edit posts
* Admins can approve, remove, or suspend posts
* Regular users have read-only access

---

## 14. Next Steps

* [ ] Design Comment schema
* [ ] Design Like schema
* [ ] Define feed and discovery queries
* [ ] Connect posts to subscription access logic

---

## 15. Notes

The Post schema is intentionally focused on **content**, not commerce.

This separation allows the platform to scale content delivery independently from monetisation logic.
