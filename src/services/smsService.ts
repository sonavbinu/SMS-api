import { sendSMS, sendOTPViaSMS } from '../config/fast2sms';
import { SmsLog } from '../models/SmsLog';
import { Otp } from '../models/Otp';
import { generateOTP, formatPhoneNumber } from '../utils/otpGenerator';
import { getEnvVariable } from '../utils/helpers';

export class SmsService {
  // Send OTP
  async sendOTP(
    phoneNumber: string
  ): Promise<{ success: boolean; message: string; otp?: string }> {
    try {
      // Format phone number (remove +91, spaces, etc.)
      const formattedNumber = formatPhoneNumber(phoneNumber);

      // Delete any existing OTPs for this number
      await Otp.deleteMany({ phoneNumber: formattedNumber });

      // Generate new OTP
      const otpLength = parseInt(getEnvVariable('OTP_LENGTH') || '6');
      const otp = generateOTP(otpLength);

      // Calculate expiry time
      const expiryMinutes = parseInt(
        getEnvVariable('OTP_EXPIRY_MINUTES') || '5'
      );
      const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

      // Save OTP to database
      await Otp.create({
        phoneNumber: formattedNumber,
        otp,
        expiresAt,
        verified: false,
        attempts: 0,
      });

      // Send SMS via Fast2SMS
      const response = await sendOTPViaSMS(formattedNumber, otp);

      // Log SMS
      await SmsLog.create({
        phoneNumber: formattedNumber,
        message: `OTP: ${otp}`,
        type: 'OTP',
        status: response.return ? 'sent' : 'failed',
        twilioSid: response.request_id,
      });

      return {
        success: response.return === true,
        message: response.return
          ? 'OTP sent successfully'
          : 'Failed to send OTP',
        otp: process.env.NODE_ENV === 'development' ? otp : undefined,
      };
    } catch (error: any) {
      const formattedNumber = formatPhoneNumber(phoneNumber);

      // Log failed SMS
      await SmsLog.create({
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
  }

  // Verify OTP
  async verifyOTP(
    phoneNumber: string,
    otp: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const formattedNumber = formatPhoneNumber(phoneNumber);
      const otpRecord = await Otp.findOne({
        phoneNumber: formattedNumber,
        verified: false,
      });

      if (!otpRecord) {
        return { success: false, message: 'OTP not found or already verified' };
      }

      // Check if OTP is expired
      if (new Date() > otpRecord.expiresAt) {
        await Otp.deleteOne({ _id: otpRecord._id });
        return { success: false, message: 'OTP has expired' };
      }

      // Check attempts
      if (otpRecord.attempts >= 3) {
        await Otp.deleteOne({ _id: otpRecord._id });
        return {
          success: false,
          message: 'Maximum verification attempts exceeded',
        };
      }

      // Verify OTP
      if (otpRecord.otp !== otp) {
        otpRecord.attempts += 1;
        await otpRecord.save();
        return {
          success: false,
          message: `Invalid OTP. ${3 - otpRecord.attempts} attempts remaining`,
        };
      }

      // Mark as verified
      otpRecord.verified = true;
      await otpRecord.save();

      return { success: true, message: 'OTP verified successfully' };
    } catch (error: any) {
      return {
        success: false,
        message: 'Verification failed: ' + error.message,
      };
    }
  }

  // Send Alert SMS
  async sendAlert(
    phoneNumber: string,
    alertMessage: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const formattedNumber = formatPhoneNumber(phoneNumber);
      const message = `ALERT: ${alertMessage}`;

      const response = await sendSMS(formattedNumber, message, 'q');

      await SmsLog.create({
        phoneNumber: formattedNumber,
        message,
        type: 'ALERT',
        status: response.return ? 'sent' : 'failed',
        twilioSid: response.request_id,
      });

      return {
        success: response.return === true,
        message: response.return
          ? 'Alert sent successfully'
          : 'Failed to send alert',
      };
    } catch (error: any) {
      const formattedNumber = formatPhoneNumber(phoneNumber);

      await SmsLog.create({
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
  }

  // Send Promotional SMS
  async sendPromotion(
    phoneNumber: string,
    promotionMessage: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const formattedNumber = formatPhoneNumber(phoneNumber);
      const message = `${promotionMessage}`;

      const response = await sendSMS(formattedNumber, message, 'q');

      await SmsLog.create({
        phoneNumber: formattedNumber,
        message,
        type: 'PROMOTION',
        status: response.return ? 'sent' : 'failed',
        twilioSid: response.request_id,
      });

      return {
        success: response.return === true,
        message: response.return
          ? 'Promotion sent successfully'
          : 'Failed to send promotion',
      };
    } catch (error: any) {
      const formattedNumber = formatPhoneNumber(phoneNumber);

      await SmsLog.create({
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
  }

  // Get SMS Logs
  async getLogs(phoneNumber?: string, limit: number = 50) {
    const formattedNumber = phoneNumber
      ? formatPhoneNumber(phoneNumber)
      : undefined;
    const query = formattedNumber ? { phoneNumber: formattedNumber } : {};

    return await SmsLog.find(query).sort({ createdAt: -1 }).limit(limit);
  }
}

export const smsService = new SmsService();
