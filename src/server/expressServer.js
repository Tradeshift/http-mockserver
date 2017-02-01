const express = require('express');
const http = require('http');
const app = express();
const bodyParser = require('body-parser');
const logService = require('./logService');

app.use(bodyParser.json());
const controller = require('./controller');

app.get('/listener/:port?', controller.getListeners);
app.post('/listener/:port', controller.addListener);
app.delete('/listener/:port', controller.removeListener);

app.post('/listener/:port/chunk', controller.sendChunk);

app.post('/mocks', controller.addMock);

app.delete('/clear', controller.clear);

app.get('/requests/:port?', controller.getRequestLogs);

app.use((err, req, res, next) => {
	logService.error(err.stack);
	res.status(400).send(err.message);
});

module.exports = http.Server(app);
