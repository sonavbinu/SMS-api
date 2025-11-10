import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db';
import { getEnvVariable } from './utils/helpers';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import smsRoutes from './routes/smsRoutes';

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Connect Database
connectDB();

// Middlewares
app.use(
  cors({
    origin:
      NODE_ENV === 'production'
        ? [
            getEnvVariable('FRONT_END_URL'),
            process.env.RENDER_EXTERNAL_URL || '',
          ]
        : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Swagger Documentation
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'SMS API Documentation',
  })
);

// API Routes
app.use('/api/sms', smsRoutes);

// Root
app.get('/', async (req, res) => {
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
});

// Health check endpoint for Render
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);
  console.log(
    `API Documentation available at http://localhost:${PORT}/api-docs`
  );
});
