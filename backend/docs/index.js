const { createServer } = require('http')
const open = require('open')

const express = require('express');
const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.set('port', 4000);

const server = createServer(app);

server.listen(4000, () => {
    open("http://localhost:4000");
});

