const express = require("express");
const {
  createProfile,
  deleteProfile,
  updateProfile,
  getProfile,
  verifyProfile,
  getProfiles,
  deactivateProfile,
  reactivateProfile,
} = require("../controllers/creatorController");

const { protect, restrictTo, verified } = require("../controllers/authController");

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Creators
 *     description: Creator profile operations
 */

/**
 * @openapi
 * /api/v1/creators:
 *   post:
 *     tags: [Creators]
 *     summary: Create a creator profile
 *     description: Creates a creator profile for the logged-in user. Requires verified user.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [displayName, specialization, subscriptionPrice, subscriptionCurrency, subscriptionInterval]
 *             properties:
 *               displayName:
 *                 type: string
 *                 example: "Coach Legend"
 *               specialization:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["strength", "yoga"]
 *               subscriptionPrice:
 *                 type: number
 *                 example: 2000
 *               subscriptionCurrency:
 *                 type: string
 *                 example: "NGN"
 *               subscriptionInterval:
 *                 type: string
 *                 example: "monthly"
 *               bio:
 *                 type: string
 *                 example: "Helping people build sustainable fitness habits."
 *               profilePhoto:
 *                 type: string
 *                 example: "https://cdn.coachx.com/u/legend/avatar.jpg"
 *               bannerImage:
 *                 type: string
 *                 example: "https://cdn.coachx.com/u/legend/banner.jpg"
 *               socialLinks:
 *                 type: object
 *                 additionalProperties: true
 *                 example:
 *                   instagram: "https://instagram.com/coachlegend"
 *                   x: "https://x.com/coachlegend"
 *     responses:
 *       201:
 *         description: Creator profile created successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: You must be verified to access this route
 *
 *   get:
 *     tags: [Creators]
 *     summary: List creator profiles (discovery)
 *     description: Returns creator profiles. Non-admins see only active profiles. Requires verified user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: specialization
 *         schema:
 *           type: string
 *         description: Comma-separated specialization filter (e.g. "yoga,strength")
 *         example: "fitness,nutrition"
 *       - in: query
 *         name: isVerified
 *         schema:
 *           type: boolean
 *         description: Filter by creator verification status
 *         example: true
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum subscription price
 *         example: 1000
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum subscription price
 *         example: 5000
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Page size (max 50)
 *         example: 10
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sort by "createdAt" or "subscriptionPrice". Use "-" for desc.
 *         example: "-createdAt"
 *     responses:
 *       200:
 *         description: Creator profiles retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: You must be verified to access this route
 */
router
  .route("/")
  .post(protect, verified, createProfile)
  .get(protect, verified, getProfiles);

/**
 * @openapi
 * /api/v1/creators/me:
 *   get:
 *     tags: [Creators]
 *     summary: Get my creator profile
 *     description: Returns creator profile for logged-in user (uses req.user).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Creator profile retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Creator profile not found
 *
 *   patch:
 *     tags: [Creators]
 *     summary: Update my creator profile
 *     description: Updates allowed fields only. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               displayName:
 *                 type: string
 *                 example: "Coach Legend"
 *               bio:
 *                 type: string
 *                 example: "I help people build fitness discipline."
 *               profilePhoto:
 *                 type: string
 *                 example: "https://cdn.coachx.com/u/legend/avatar.jpg"
 *               bannerImage:
 *                 type: string
 *                 example: "https://cdn.coachx.com/u/legend/banner.jpg"
 *               socialLinks:
 *                 type: object
 *                 additionalProperties: true
 *                 example:
 *                   instagram: "https://instagram.com/coachlegend"
 *               specialization:
 *                 oneOf:
 *                   - type: array
 *                     items: { type: string }
 *                   - type: string
 *                 example: ["strength", "yoga"]
 *               subscriptionPrice:
 *                 type: number
 *                 example: 2500
 *               subscriptionCurrency:
 *                 type: string
 *                 example: "NGN"
 *               subscriptionInterval:
 *                 type: string
 *                 example: "monthly"
 *     responses:
 *       200:
 *         description: Creator profile updated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: You are not allowed to edit this profile
 *
 *   delete:
 *     tags: [Creators]
 *     summary: Delete my creator profile
 *     description: Deletes the creator profile. (Your controller currently checks admin in some paths; ensure behaviour is consistent.)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Creator profile deleted
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get("/me", protect, getProfile);
router.patch("/me", protect, updateProfile);
router.delete("/me", protect, deleteProfile);

/**
 * @openapi
 * /api/v1/creators/{creatorId}/deactivate:
 *   post:
 *     tags: [Creators]
 *     summary: Deactivate a creator profile
 *     description: Owner or admin can deactivate a profile.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: creatorId
 *         required: true
 *         schema:
 *           type: string
 *         example: "65f1c2a9c1a2b3c4d5e6f789"
 *     responses:
 *       200:
 *         description: Creator profile deactivated
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Not allowed
 *       404:
 *         description: Creator profile not found
 */
router.post("/:creatorId/deactivate", protect, deactivateProfile);

/**
 * @openapi
 * /api/v1/creators/{creatorId}/reactivate:
 *   post:
 *     tags: [Creators]
 *     summary: Reactivate a creator profile
 *     description: Owner or admin can reactivate a profile.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: creatorId
 *         required: true
 *         schema:
 *           type: string
 *         example: "65f1c2a9c1a2b3c4d5e6f789"
 *     responses:
 *       200:
 *         description: Creator profile reactivated
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Not allowed
 *       404:
 *         description: Creator profile not found
 */
router.post("/:creatorId/reactivate", protect, reactivateProfile);

/**
 * @openapi
 * /api/v1/creators/{creatorId}:
 *   delete:
 *     tags: [Creators]
 *     summary: Admin delete a creator profile (permanent)
 *     description: Admin-only permanent delete by creatorId.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: creatorId
 *         required: true
 *         schema:
 *           type: string
 *         example: "65f1c2a9c1a2b3c4d5e6f789"
 *     responses:
 *       204:
 *         description: Deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden (admin only)
 *       404:
 *         description: Creator profile not found
 */
router.delete("/:creatorId", protect, restrictTo("admin"), deleteProfile);

/**
 * @openapi
 * /api/v1/creators/{id}:
 *   get:
 *     tags: [Creators]
 *     summary: Get a creator profile by id
 *     description: Returns public profile fields for non-owner/non-admin. Requires verified user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "65f1c2a9c1a2b3c4d5e6f789"
 *     responses:
 *       200:
 *         description: Creator profile retrieved
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: You must be verified to access this route
 *       404:
 *         description: Creator profile not found
 */
router.get("/:id", protect, verified, getProfile);

/**
 * @openapi
 * /api/v1/creators/{creatorId}/verify:
 *   patch:
 *     tags: [Creators]
 *     summary: Verify a creator profile (admin)
 *     description: Admin marks a creator profile as verified.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: creatorId
 *         required: true
 *         schema:
 *           type: string
 *         example: "65f1c2a9c1a2b3c4d5e6f789"
 *     responses:
 *       200:
 *         description: Creator profile verified
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden (admin only)
 *       404:
 *         description: Creator profile not found
 */
router.patch("/:creatorId/verify", protect, restrictTo("admin"), verifyProfile);

module.exports = router;
