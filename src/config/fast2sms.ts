import axios from 'axios';
import { getEnvVariable } from '../utils/helpers';

const FAST2SMS_API_KEY = getEnvVariable('FAST2SMS_API_KEY');
const FAST2SMS_BASE_URL = 'https://www.fast2sms.com/dev/bulkV2';

export const sendSMS = async (
  numbers: string | string[],
  message: string,
  route: 'q' | 'dlt' = 'q'
) => {
  try {
    const response = await axios.get(FAST2SMS_BASE_URL, {
      headers: {
        authorization: FAST2SMS_API_KEY,
        route: route,
        message: message,
        numbers: Array.isArray(numbers) ? numbers.join(',') : numbers,
        flash: 0,
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(`Fast2SMS Error: ${error.message}`);
  }
};

export const sendOTPViaSMS = async (
  numbers: string | string[],
  otp: string
) => {
  try {
    const response = await axios.post(FAST2SMS_BASE_URL, {
      headers: {
        authorization: FAST2SMS_API_KEY,

        route: 'otp',
        variables_values: otp,
        numbers: Array.isArray(numbers) ? numbers.join(',') : numbers,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Fast2SMS OTP Error:', error.response?.data || error.message);
    throw new Error(
      `Fast2SMS OTP Error: ${error.response?.data?.message || error.message}`
    );
  }
};
