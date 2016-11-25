const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const app = express();
const server = http.Server(app);
app.use(bodyParser.json());
const controller = require('./controller');

app.get('/listener/:port', controller.getListener);
app.post('/listener/:port', controller.addListener);
app.delete('/listener/:port', controller.removeListener);

app.post('/listener/:port/route', controller.addRoute);
app.post('/listener/:port/chunk', controller.sendChunk);

app.get('/listener', controller.getListeners);
app.delete('/listener', controller.removeListeners);

app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(400).send(err.message);
});

server.listen(3000);
console.log('Running on http://localhost:3000');
