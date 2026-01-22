const express = require("express");
const {
  signup,
  login,
  forgotpassword,
  resetPassword,
  verifyEmail,
  protect,
  verified,
  verifyOTP,
} = require("../controllers/authController");
const { updateMe, getUser } = require("../controllers/userController");

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: Authentication and account flows
 *   - name: Users
 *     description: User profile endpoints
 */

/**
 * @openapi
 * /api/v1/users/signup:
 *   post:
 *     tags: [Auth]
 *     summary: Create a new user account
 *     description: Creates a user and returns a JWT token. An OTP may be sent to email for verification.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email, password, passwordConfirm]
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: "Legend"
 *               email:
 *                 type: string
 *                 example: "legend@gmail.com"
 *               password:
 *                 type: string
 *                 example: "StrongPass123!"
 *               passwordConfirm:
 *                 type: string
 *                 example: "StrongPass123!"
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 */
router.route("/signup").post(signup);

/**
 * @openapi
 * /api/v1/users/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login a user
 *     description: Returns a JWT token if email/password is valid.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: "legend@gmail.com"
 *               password:
 *                 type: string
 *                 example: "StrongPass123!"
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.route("/login").post(login);

/**
 * @openapi
 * /api/v1/users/forgotpassword:
 *   post:
 *     tags: [Auth]
 *     summary: Request password reset
 *     description: Sends a password reset token/link to the user's email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 example: "legend@gmail.com"
 *     responses:
 *       200:
 *         description: Reset token sent to mail
 *       404:
 *         description: User not found
 */
router.route("/forgotpassword").post(forgotpassword);

/**
 * @openapi
 * /api/v1/users/resetpassword/{token}:
 *   patch:
 *     tags: [Auth]
 *     summary: Reset password using token
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Password reset token sent to email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password, passwordConfirm]
 *             properties:
 *               password:
 *                 type: string
 *                 example: "NewStrongPass123!"
 *               passwordConfirm:
 *                 type: string
 *                 example: "NewStrongPass123!"
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Token invalid or expired
 */
router.route("/resetpassword/:token").patch(resetPassword);

/**
 * @openapi
 * /api/v1/users/verifyemail/{token}:
 *   patch:
 *     tags: [Auth]
 *     summary: Verify email using token
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Email verification token
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       401:
 *         description: Token invalid or expired
 */
router.route("/verifyemail/:token").patch(verifyEmail);

/**
 * @openapi
 * /api/v1/users/VerifyOtp:
 *   post:
 *     tags: [Auth]
 *     summary: Verify OTP (protected)
 *     description: Verifies OTP for the authenticated user (or provided user id if your controller accepts it).
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [otp]
 *             properties:
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               user:
 *                 type: string
 *                 description: Optional. If omitted, it uses logged-in user id.
 *                 example: "65f1c2a9c1a2b3c4d5e6f789"
 *     responses:
 *       200:
 *         description: User email verified successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       400:
 *         description: Invalid OTP details
 */
router.route("/VerifyOtp").post(protect, verifyOTP);

// All routes below require auth
router.use(protect);

/**
 * @openapi
 * /api/v1/users/updateme:
 *   patch:
 *     tags: [Users]
 *     summary: Update current user profile
 *     description: Updates allowed fields only (gender, fitnessGoal). Requires verified user.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               gender:
 *                 type: string
 *                 example: "male"
 *               fitnessGoal:
 *                 type: string
 *                 example: "muscle_gain"
 *     responses:
 *       200:
 *         description: User updated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.route("/updateme").patch(verified, updateMe);

/**
 * @openapi
 * /api/v1/users/me:
 *   get:
 *     tags: [Users]
 *     summary: Get current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.route("/me").get(verified, getUser);

module.exports = router;
