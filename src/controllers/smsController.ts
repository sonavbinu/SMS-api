import { Request, Response } from 'express';
import { smsService } from '../services/smsService';
import { validatePhoneNumber } from '../utils/otpGenerator';

class SmsController {
  /**
   * Send OTP to phone number
   */
  async sendOTP(req: Request, res: Response): Promise<void> {
    try {
      const { phoneNumber } = req.body;

      // Validate phone number
      if (!phoneNumber) {
        res.status(400).json({
          success: false,
          message: 'Phone number is required',
        });
        return;
      }

      if (!validatePhoneNumber(phoneNumber)) {
        res.status(400).json({
          success: false,
          message: 'Invalid phone number. Please provide a valid 10-digit Indian phone number',
        });
        return;
      }

      const result = await smsService.sendOTP(phoneNumber);

      res.status(200).json({
        success: true,
        message: 'OTP sent successfully',
        // Only send OTP in development mode for testing
        ...(process.env.NODE_ENV === 'development' && { otp: result.otp }),
      });
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to send OTP',
      });
    }
  }

  /**
   * Verify OTP
   */
  async verifyOTP(req: Request, res: Response): Promise<void> {
    try {
      const { phoneNumber, otp } = req.body;

      // Validate inputs
      if (!phoneNumber || !otp) {
        res.status(400).json({
          success: false,
          message: 'Phone number and OTP are required',
        });
        return;
      }

      if (!validatePhoneNumber(phoneNumber)) {
        res.status(400).json({
          success: false,
          message: 'Invalid phone number',
        });
        return;
      }

      const isValid = await smsService.verifyOTP(phoneNumber, otp);

      if (isValid) {
        res.status(200).json({
          success: true,
          message: 'OTP verified successfully',
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Invalid or expired OTP',
        });
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to verify OTP',
      });
    }
  }

  /**
   * Send alert SMS
   */
  async sendAlert(req: Request, res: Response): Promise<void> {
    try {
      const { phoneNumber, message } = req.body;

      // Validate inputs
      if (!phoneNumber || !message) {
        res.status(400).json({
          success: false,
          message: 'Phone number and message are required',
        });
        return;
      }

      if (!validatePhoneNumber(phoneNumber)) {
        res.status(400).json({
          success: false,
          message: 'Invalid phone number',
        });
        return;
      }

      await smsService.sendAlert(phoneNumber, message);

      res.status(200).json({
        success: true,
        message: 'Alert sent successfully',
      });
    } catch (error: any) {
      console.error('Error sending alert:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to send alert',
      });
    }
  }

  /**
   * Send promotional SMS
   */
  async sendPromotion(req: Request, res: Response): Promise<void> {
    try {
      const { phoneNumber, message } = req.body;

      // Validate inputs
      if (!phoneNumber || !message) {
        res.status(400).json({
          success: false,
          message: 'Phone number and message are required',
        });
        return;
      }

      if (!validatePhoneNumber(phoneNumber)) {
        res.status(400).json({
          success: false,
          message: 'Invalid phone number',
        });
        return;
      }

      await smsService.sendPromotion(phoneNumber, message);

      res.status(200).json({
        success: true,
        message: 'Promotion sent successfully',
      });
    } catch (error: any) {
      console.error('Error sending promotion:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to send promotion',
      });
    }
  }

  /**
   * Get SMS logs
   */
  async getLogs(req: Request, res: Response): Promise<void> {
    try {
      const { phoneNumber, limit } = req.query;

      const logs = await smsService.getLogs(
        phoneNumber as string,
        limit ? parseInt(limit as string) : 50
      );

      res.status(200).json({
        success: true,
        data: logs,
      });
    } catch (error: any) {
      console.error('Error fetching logs:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch logs',
      });
    }
  }
}

export const smsController = new SmsController();

