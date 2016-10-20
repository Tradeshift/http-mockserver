const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const listeners = {};

function isListening (port) {
	if (listeners[port]) {
		return true;
	}
}

function addListener (port) {
	const app = express();
	app.use(bodyParser.json());
	const server = http.Server(app);

	server.listen(port);
	console.log(`Server is listening on port ${port}`);
	listeners[port] = { app, server, routes: {} };
}

function sendChunk (port, route, chunk) {
	const listener = listeners[port];
	if (!listener) {
		throw new Error('No listener exists on ' + port);
	}

	if (!listener.routes[route]) {
		throw new Error(`Route does not exist ${port}/${route}`);
	}

	const clients = listener.routes[route].clients;
	clients.forEach(res => res.write(chunk));
}

function addRoute (port, method, route, response) {
	const listener = listeners[port];
	if (!listener) {
		throw new Error('No listener exists on ' + port);
	}
	if (listener.routes[route]) {
		throw new Error(`Route alredy exists ${route}`);
	}
	listener.routes[route] = {
		responseData: response,
		clients: []
	};

	console.log(`Creating route ${method} ${route} ${port}`);
	listener.app[method](route, (req, res) => {
		if (response) {
			console.log('Sending', response, `to route ${route} port: ${port} method: ${method}`);
			res.status(response.statusCode).send(response.body);
		} else {
			console.log(`Add open response for route ${route} port: ${port} method: ${method}`);
			listener.routes[route].clients.push(res);
		}
	});
}

module.exports = {
	isListening,
	addListener,
	addRoute,
	sendChunk
};
