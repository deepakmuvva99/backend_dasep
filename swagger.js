const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
        title: 'Digital Evaluation Platform API',
        description: 'Auto-generated documentation for the Digital Evaluation Platform APIs.'
    },
    host: 'localhost:3000',
    basePath: '/',
    schemes: ['http'],
    securityDefinitions: {
        bearerAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'Authorization',
            description: 'Enter your Bearer token in the format: Bearer <token>'
        }
    },
    security: [ { bearerAuth: [] } ]
};

const outputFile = './swagger_output.json';
// Provide the entry point of the application
const endpointsFiles = ['./app.js'];

// Generate the swagger_output.json file
swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
    console.log('Swagger documentation successfully generated at swagger_output.json');
});
