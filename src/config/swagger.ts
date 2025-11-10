import swaggerJSDoc from 'swagger-jsdoc';

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const getServerUrl = () => {
  if (NODE_ENV === 'production') {
    return process.env.RENDER_EXTERNAL_URL;
  }
};
