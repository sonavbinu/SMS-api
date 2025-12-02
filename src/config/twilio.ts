import twilio from 'twilio';
import { getEnvVariable } from '../utils/helpers';

// Load environment variables
const accountSid = getEnvVariable('TWILIO_ACCOUNT_SID');
const authToken = getEnvVariable('TWILIO_AUTH_TOKEN');
const fromNumber = getEnvVariable('TWILIO_PHONE_NUMBER');

// Initialize Twilio client
export const twilioClient = twilio(accountSid, authToken);

// Generic SMS sender
export async function sendSMSViaTwilio(to: string, body: string) {
  try {
    const message = await twilioClient.messages.create({
      body,
      from: fromNumber,
      to,
    });
    return { success: true, sid: message.sid };
  } catch (error: any) {
    console.error('Twilio SMS error:', error.message);
    return { success: false, error: error.message };
  }
}

// OTP sender (wrapper around sendSMS)
export async function sendOTPViaTwilio(to: string, otp: string) {
  return await sendSMSViaTwilio(
    to,
    `Your OTP is ${otp}. It will expire in ${getEnvVariable(
      'OTP_EXPIRY_MINUTES'
    )} minutes.`
  );
}
