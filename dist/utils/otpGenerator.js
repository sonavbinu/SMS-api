"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatPhoneNumber = exports.validatePhoneNumber = exports.generateOTP = void 0;
const crypto_1 = __importDefault(require("crypto"));
const generateOTP = (length = 6) => Array.from({ length }, () => crypto_1.default.randomInt(0, 10)).join('');
exports.generateOTP = generateOTP;
const validatePhoneNumber = (phoneNumber) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phoneNumber);
};
exports.validatePhoneNumber = validatePhoneNumber;
const formatPhoneNumber = (phoneNumber) => {
    const cleaned = phoneNumber.replace(/[\s\-]/g, '');
    if (!cleaned.startsWith('+91')) {
        return `+91${cleaned.replace(/^91/, '')}`;
    }
    return cleaned;
};
exports.formatPhoneNumber = formatPhoneNumber;
