import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const client = twilio(accountSid, authToken);

export async function sendSMS(to: string, body: string) {
  try {
    const message = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER, // trial number
      to, // recipient number with country code
    });
    console.log('SMS sent:', message.sid);
    return { success: true, sid: message.sid };
  } catch (error: any) {
    console.error('SMS error:', error.message);
    return { success: false, error: error.message };
  }
}
