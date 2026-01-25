const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'CoachX API',
    version: '1.0.0',
    description: 'CoachX Backend API documentation (MVP)',
  },
  tags: [
    { name: 'Auth', description: 'Authentication and account flows' },
    { name: 'Users', description: 'User profile endpoints' },
    { name: 'Creators', description: 'Creator profile operations' },
  ],
  servers: [
    { url: 'http://localhost:3000', description: 'Local' },
    { url: 'https://server.coach-x.xyz', description: 'Production' },
    { url: 'https://coachx-backend.vercel.app', description: 'Vercel' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    responses: {
      UnauthorizedError: {
        description: 'Access token is missing or invalid',
      },
      ForbiddenError: {
        description: 'You do not have permission to access this resource',
      },
    },
  },
};

module.exports = swaggerJSDoc({
  swaggerDefinition,
  apis: ['./routes/*.js', './controllers/*.js'],
});
