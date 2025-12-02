import crypto from 'crypto';
export const generateOTP = (length = 6): string =>
  Array.from({ length }, () => crypto.randomInt(0, 10)).join('');

export const validatePhoneNumber = (phoneNumber: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phoneNumber);
};

export const formatPhoneNumber = (phoneNumber: string): string => {
  const cleaned = phoneNumber.replace(/[\s\-]/g, '');
  if (!cleaned.startsWith('+91')) {
    return `+91${cleaned.replace(/^91/, '')}`;
  }
  return cleaned;
};
