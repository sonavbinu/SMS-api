"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatPhoneNumber = exports.validatePhoneNumber = exports.generateOTP = void 0;
const generateOTP = (length = 6) => {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
};
exports.generateOTP = generateOTP;
const validatePhoneNumber = (phoneNumber) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phoneNumber);
};
exports.validatePhoneNumber = validatePhoneNumber;
const formatPhoneNumber = (phoneNumber) => {
    return phoneNumber.replace(/[\s\-+]/g, '').replace(/^91/, '');
};
exports.formatPhoneNumber = formatPhoneNumber;
