const swaggerAutogen = require('swagger-autogen')();
const doc = {
    info: {
      title: 'My API',
      description: 'Description',
    },
    host: 'localhost:3100',
    schemes: ['http'],
};
const outputFile = 'swagger-output.json'; //file che creo
const endpointsFiles = ['api.js']; //da dove prendo le API
swaggerAutogen(outputFile, endpointsFiles, doc);