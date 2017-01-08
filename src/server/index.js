const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const app = express();
const server = http.Server(app);
app.use(bodyParser.json());
const controller = require('./controller');

app.post('/listener/:port', controller.addListenerOrRoute);
app.delete('/listener/:port', controller.removeListener);

app.post('/listener/:port/chunk', controller.sendChunk);

app.get('/listener/:port?', controller.getListeners);
app.delete('/clear', controller.clear);

app.get('/requests/:port?', controller.getRequestLogs);

app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(400).send(err.message);
});

module.exports = function (port) {
	server.listen(port);
	console.log(`Running on http://localhost:${port}`);
};
