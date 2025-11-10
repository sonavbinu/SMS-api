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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./config/db");
const helpers_1 = require("./utils/helpers");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./config/swagger");
const smsRoutes_1 = __importDefault(require("./routes/smsRoutes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
// Connect Database
(0, db_1.connectDB)();
// Middlewares
app.use((0, cors_1.default)({
    origin: NODE_ENV === 'production'
        ? [
            (0, helpers_1.getEnvVariable)('FRONT_END_URL'),
            process.env.RENDER_EXTERNAL_URL || '',
        ]
        : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// Swagger Documentation
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'SMS API Documentation',
}));
// API Routes
app.use('/api/sms', smsRoutes_1.default);
// Root
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({
        message: 'SMS API is running',
        documentation: `${req.protocol}://${req.get('host')}/api-docs`,
        endpoints: {
            sendOTP: '/api/sms/send-otp',
            verifyOTP: '/api/sms/verify-otp',
            sendAlert: '/api/sms/send-alert',
            sendPromotion: '/api/sms/send-promotion',
            logs: '/api/sms/logs',
        },
    });
}));
// Health check endpoint for Render
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});
// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${NODE_ENV}`);
    console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
});
