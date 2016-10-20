const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const app = express();
const server = http.Server(app);
app.use(bodyParser.json());
const service = require('./service');

app.post('/listener/:port', (req, res) => {
	service.addListener(req.params.port);
	res.send('Listener created on ' + req.params.port);
});

app.get('/listener/:port', (req, res) => {
	res.sendStatus(service.isListening(req.params.port) ? 200 : 404);
});

app.post('/listener/:port/route', (req, res) => {
	const port = req.params.port;
	const method = req.body.method.toLowerCase();
	const route = req.body.route;
	const response = req.body.response;

	try {
		service.addRoute(port, method, route, response);
		res.send(`Route created on localhost:${port}/${route} (${method})`);
	} catch (e) {
		console.error(e);
		res.status(400).send(e.message);
	}
});

app.post('/listener/:port/chunk', (req, res) => {
	const port = req.params.port;
	const route = req.body.route;
	console.log(`Send chunk to ${port} ${route} ${req.body.data}`);
	const chunk = Buffer.from(req.body.data, 'base64');
	try {
		service.sendChunk(port, route, chunk);
		res.sendStatus(200);
	} catch (e) {
		console.error(e);
		res.status(400).send(e.message);
	}
});

server.listen(3000);
console.log('Running on http://localhost:3000');
