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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOTPViaSMS = exports.sendSMS = void 0;
const axios_1 = __importDefault(require("axios"));
const helpers_1 = require("../utils/helpers");
const FAST2SMS_API_KEY = (0, helpers_1.getEnvVariable)('FAST2SMS_API_KEY');
const FAST2SMS_BASE_URL = 'https://www.fast2sms.com/dev/bulkV2';
const sendSMS = (numbers_1, message_1, ...args_1) => __awaiter(void 0, [numbers_1, message_1, ...args_1], void 0, function* (numbers, message, route = 'q') {
    try {
        const response = yield axios_1.default.get(FAST2SMS_BASE_URL, {
            params: {
                authorization: FAST2SMS_API_KEY,
                route: route,
                message: message,
                numbers: Array.isArray(numbers) ? numbers.join(',') : numbers,
                flash: 0,
            },
        });
        return response.data;
    }
    catch (error) {
        throw new Error(`Fast2SMS Error: ${error.message}`);
    }
});
exports.sendSMS = sendSMS;
const sendOTPViaSMS = (numbers, otp) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(FAST2SMS_BASE_URL, {
            params: {
                authorization: FAST2SMS_API_KEY,
                route: 'otp',
                variables_values: otp,
                numbers: Array.isArray(numbers) ? numbers.join(',') : numbers,
            },
        });
        return response.data;
    }
    catch (error) {
        throw new Error(`Fast2SMS OTP Error: ${error.message}`);
    }
});
exports.sendOTPViaSMS = sendOTPViaSMS;
