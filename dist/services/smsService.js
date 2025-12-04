"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.smsService = exports.SmsService = void 0;
const twilio_1 = require("../config/twilio");
const SmsLog_1 = require("../models/SmsLog");
const Otp_1 = require("../models/Otp");
const otpGenerator_1 = require("../utils/otpGenerator");
const helpers_1 = require("../utils/helpers");
class SmsService {
    // Send OTP
    sendOTP(phoneNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const formattedNumber = (0, otpGenerator_1.formatPhoneNumber)(phoneNumber);
                // Delete any existing OTPs for this number
                yield Otp_1.Otp.deleteMany({ phoneNumber: formattedNumber });
                // Generate new OTP
                const otpLength = parseInt((0, helpers_1.getEnvVariable)('OTP_LENGTH') || '6');
                const otp = (0, otpGenerator_1.generateOTP)(otpLength);
                // Calculate expiry time
                const expiryMinutes = parseInt((0, helpers_1.getEnvVariable)('OTP_EXPIRY_MINUTES') || '5');
                const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
                // Save OTP to database
                yield Otp_1.Otp.create({
                    phoneNumber: formattedNumber,
                    otp,
                    expiresAt,
                    verified: false,
                    attempts: 0,
                });
                // Send SMS via Twilio
                const response = yield (0, twilio_1.sendOTPViaTwilio)(formattedNumber, otp);
                yield SmsLog_1.SmsLog.create({
                    phoneNumber: formattedNumber,
                    message: `OTP: ${otp}`,
                    type: 'OTP',
                    status: response.success ? 'sent' : 'failed',
                    twilioSid: response.sid,
                });
                return {
                    success: response.success,
                    message: response.success
                        ? 'OTP sent successfully'
                        : 'Failed to send OTP',
                    otp: process.env.NODE_ENV === 'development' ? otp : undefined,
                };
            }
            catch (error) {
                const formattedNumber = (0, otpGenerator_1.formatPhoneNumber)(phoneNumber);
                console.error(error);
                yield SmsLog_1.SmsLog.create({
                    phoneNumber: formattedNumber,
                    message: 'OTP send failed',
                    type: 'OTP',
                    status: 'failed',
                    error: error.message,
                });
                return {
                    success: false,
                    message: 'Failed to send OTP: ' + error.message,
                };
            }
        });
    }
    // Verify OTP
    verifyOTP(phoneNumber, otp) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const formattedNumber = (0, otpGenerator_1.formatPhoneNumber)(phoneNumber);
                const otpRecord = yield Otp_1.Otp.findOne({
                    phoneNumber: formattedNumber,
                    verified: false,
                });
                if (!otpRecord) {
                    return { success: false, message: 'OTP not found or already verified' };
                }
                if (new Date() > otpRecord.expiresAt) {
                    yield Otp_1.Otp.deleteOne({ _id: otpRecord._id });
                    return { success: false, message: 'OTP has expired' };
                }
                if (otpRecord.attempts >= 3) {
                    yield Otp_1.Otp.deleteOne({ _id: otpRecord._id });
                    return {
                        success: false,
                        message: 'Maximum verification attempts exceeded',
                    };
                }
                if (otpRecord.otp !== otp) {
                    otpRecord.attempts += 1;
                    yield otpRecord.save();
                    return {
                        success: false,
                        message: `Invalid OTP. ${3 - otpRecord.attempts} attempts remaining`,
                    };
                }
                otpRecord.verified = true;
                yield otpRecord.save();
                const response = yield (0, twilio_1.sendSMSViaTwilio)(formattedNumber, 'Your OTP was verified successfully!');
                yield SmsLog_1.SmsLog.create({
                    phoneNumber: formattedNumber,
                    message: 'OTP verified successfully',
                    type: 'OTP',
                    status: response.success ? 'sent' : 'failed',
                    twilioSid: response.sid,
                });
                return { success: true, message: 'OTP verified successfully' };
            }
            catch (error) {
                return {
                    success: false,
                    message: 'Verification failed: ' + error.message,
                };
            }
        });
    }
    // Send Alert SMS
    sendAlert(phoneNumber, alertMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const formattedNumber = (0, otpGenerator_1.formatPhoneNumber)(phoneNumber);
                const message = `ALERT: ${alertMessage}`;
                const response = yield (0, twilio_1.sendSMSViaTwilio)(formattedNumber, message);
                yield SmsLog_1.SmsLog.create({
                    phoneNumber: formattedNumber,
                    message,
                    type: 'ALERT',
                    status: response.success ? 'sent' : 'failed',
                    twilioSid: response.sid,
                });
                return {
                    success: response.success,
                    message: response.success
                        ? 'Alert sent successfully'
                        : 'Failed to send alert',
                };
            }
            catch (error) {
                const formattedNumber = (0, otpGenerator_1.formatPhoneNumber)(phoneNumber);
                yield SmsLog_1.SmsLog.create({
                    phoneNumber: formattedNumber,
                    message: alertMessage,
                    type: 'ALERT',
                    status: 'failed',
                    error: error.message,
                });
                return {
                    success: false,
                    message: 'Failed to send alert: ' + error.message,
                };
            }
        });
    }
    // Send Promotional SMS
    sendPromotion(phoneNumber, promotionMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const formattedNumber = (0, otpGenerator_1.formatPhoneNumber)(phoneNumber);
                const message = promotionMessage;
                const response = yield (0, twilio_1.sendSMSViaTwilio)(formattedNumber, message);
                yield SmsLog_1.SmsLog.create({
                    phoneNumber: formattedNumber,
                    message,
                    type: 'PROMOTION',
                    status: response.success ? 'sent' : 'failed',
                    twilioSid: response.sid,
                });
                return {
                    success: response.success,
                    message: response.success
                        ? 'Promotion sent successfully'
                        : 'Failed to send promotion',
                };
            }
            catch (error) {
                const formattedNumber = (0, otpGenerator_1.formatPhoneNumber)(phoneNumber);
                yield SmsLog_1.SmsLog.create({
                    phoneNumber: formattedNumber,
                    message: promotionMessage,
                    type: 'PROMOTION',
                    status: 'failed',
                    error: error.message,
                });
                return {
                    success: false,
                    message: 'Failed to send promotion: ' + error.message,
                };
            }
        });
    }
    // Get SMS Logs
    getLogs(phoneNumber_1) {
        return __awaiter(this, arguments, void 0, function* (phoneNumber, limit = 50) {
            const formattedNumber = phoneNumber
                ? (0, otpGenerator_1.formatPhoneNumber)(phoneNumber)
                : undefined;
            const query = formattedNumber ? { phoneNumber: formattedNumber } : {};
            return yield SmsLog_1.SmsLog.find(query).sort({ createdAt: -1 }).limit(limit);
        });
    }
}
exports.SmsService = SmsService;
exports.smsService = new SmsService();
