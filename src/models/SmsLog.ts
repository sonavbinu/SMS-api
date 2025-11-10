import mongoose, { Document, Schema } from 'mongoose';

export interface ISmsLog extends Document {
  phoneNumber: string;
  message: string;
  type: 'OTP' | 'ALERT' | 'PROMOTION';
  status: 'sent' | 'failed' | 'pending';
  twilioSid?: string;
  error?: string;
  createdAt: Date;
}

const smsLogSchema = new Schema<ISmsLog>({
  phoneNumber: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['OTP', 'ALERT', 'PROMOTION'],
    required: true,
  },
  status: {
    type: String,
    enum: ['sent', 'failed', 'pending'],
    default: 'pending',
  },
  twilioSid: String,
  error: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const SmsLog = mongoose.model<ISmsLog>('SmsLog', smsLogSchema);
