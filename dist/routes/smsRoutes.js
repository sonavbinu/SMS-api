"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const smsController_1 = require("../controllers/smsController");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/sms/send-otp:
 *   post:
 *     summary: Send OTP to a phone number
 *     tags: [SMS]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 description: 10-digit Indian phone number
 *                 example: "9876543210"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "OTP sent successfully"
 *                 otp:
 *                   type: string
 *                   description: OTP code (only in development mode)
 *                   example: "123456"
 *       400:
 *         description: Bad request
 *       429:
 *         description: Too many requests
 */
router.post('/send-otp', rateLimiter_1.otpLimiter, smsController_1.smsController.sendOTP.bind(smsController_1.smsController));
/**
 * @swagger
 * /api/sms/verify-otp:
 *   post:
 *     summary: Verify OTP
 *     tags: [SMS]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - otp
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 description: 10-digit Indian phone number
 *                 example: "9876543210"
 *               otp:
 *                 type: string
 *                 description: 6-digit OTP code
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "OTP verified successfully"
 *       400:
 *         description: Invalid OTP or OTP expired
 */
router.post('/verify-otp', smsController_1.smsController.verifyOTP.bind(smsController_1.smsController));
/**
 * @swagger
 * /api/sms/send-alert:
 *   post:
 *     summary: Send alert SMS
 *     tags: [SMS]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - message
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 description: 10-digit Indian phone number
 *                 example: "9876543210"
 *               message:
 *                 type: string
 *                 description: Alert message to send
 *                 example: "Your account has been accessed from a new device"
 *     responses:
 *       200:
 *         description: Alert sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Alert sent successfully"
 *       400:
 *         description: Bad request
 *       429:
 *         description: Too many requests
 */
router.post('/send-alert', rateLimiter_1.smsLimiter, smsController_1.smsController.sendAlert.bind(smsController_1.smsController));
/**
 * @swagger
 * /api/sms/send-promotion:
 *   post:
 *     summary: Send promotional SMS
 *     tags: [SMS]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - message
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 description: 10-digit Indian phone number
 *                 example: "9876543210"
 *               message:
 *                 type: string
 *                 description: Promotional message to send
 *                 example: "Get 50% off on your next purchase! Use code: SAVE50"
 *     responses:
 *       200:
 *         description: Promotion sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Promotion sent successfully"
 *       400:
 *         description: Bad request
 *       429:
 *         description: Too many requests
 */
router.post('/send-promotion', rateLimiter_1.smsLimiter, smsController_1.smsController.sendPromotion.bind(smsController_1.smsController));
/**
 * @swagger
 * /api/sms/logs:
 *   get:
 *     summary: Get SMS logs
 *     tags: [SMS]
 *     parameters:
 *       - in: query
 *         name: phoneNumber
 *         schema:
 *           type: string
 *         description: Filter logs by phone number
 *         example: "9876543210"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of logs to retrieve
 *         example: 10
 *     responses:
 *       200:
 *         description: SMS logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       phoneNumber:
 *                         type: string
 *                       message:
 *                         type: string
 *                       type:
 *                         type: string
 *                         enum: [OTP, ALERT, PROMOTION]
 *                       status:
 *                         type: string
 *                         enum: [sent, failed, pending]
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 */
router.get('/logs', smsController_1.smsController.getLogs.bind(smsController_1.smsController));
exports.default = router;
