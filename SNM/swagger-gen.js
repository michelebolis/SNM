const swaggerAutogen = require('swagger-autogen')();
const doc = {
    info: {
      title: 'SNM API',
      description: 'API dell applicativo web SNM',
    },
    host: 'localhost:3100',
    schemes: ['http'],
};
const outputFile = 'swagger-output.json'; //file che creo
const endpointsFiles = ['api.js']; //da dove prendo le API
swaggerAutogen(outputFile, endpointsFiles, doc);