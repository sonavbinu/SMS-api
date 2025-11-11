import swaggerJSDoc from 'swagger-jsdoc';

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const getServerUrl = () => {
  if (NODE_ENV === 'production') {
    return (
      process.env.RENDER_EXTERNAL_URL || 'https://sms-api-ne6y.onrender.com'
    );
  }
  return `http://localhost:${PORT}`;
};

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SMS API Documentation',
      version: '1.0.0',
      description:
        'Complete API documentation for SMS service with OTP, Alerts, and Promotions using Fast2SMS',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: getServerUrl(),
        description:
          NODE_ENV === 'production'
            ? 'Production server'
            : 'Development server',
      },
    ],
    tags: [
      {
        name: 'SMS',
        description: 'SMS operations including OTP, Alerts, and Promotions',
      },
    ],
    components: {
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Operation successful',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './dist/routes/*.js'], // Support both TS and compiled JS
};

export const swaggerSpec = swaggerJSDoc(options);
