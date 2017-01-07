const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const enableDestroy = require('server-destroy');
const Listener = require('./Listener');
const requestService = require('./requestService');

const listeners = {};
const listenerService = {};

listenerService.get = function (port) {
	const listener = listeners[port];
	if (!listener) {
		throw new Error(`Can't get listener. No listener exists on ${port}`);
	}
	return listener;
};

listenerService.add = function (port) {
	if (listeners[port]) {
		throw new Error(`Listener already exists: ${port}`);
	}

	const app = express();
	app.use(bodyParser.json());
	app.use((req, res, next) => {
		requestService.addRequest(req, 'pending');
		next();
	});

	console.log(`Added listener on port ${port}`);
	const server = createServer(port, app);

	const listener = new Listener({ port, app, server });
	listeners[port] = listener;
	return listener;
};

listenerService.addRoute = function (port, options) {
	const listener = listeners[port] || listenerService.add(port);
	const hasRoute = listener.get(options.uri, options.method);
	if (hasRoute) {
		throw new Error(`Route already exists: ${options.uri}`);
	}

	listener.add(options.uri, options.method, options);
};

listenerService.remove = function (port) {
	if (!listeners[port]) {
		throw new Error(`Can't remove listener. No listener exists on ${port}`);
	}

	listeners[port].destroy();
	delete listeners[port];
	console.log('Removed listener for', port);
};

listenerService.sendChunk = function (port, uri, chunk) {
	const listener = listeners[port];
	if (!listener) {
		throw new Error(`Can't send chunk. No listener exists on ${port}`);
	}
	listener.sendChunk(uri, chunk);
};

// Remove listeners
listenerService.clear = function () {
	Object.keys(listeners).forEach(port => listenerService.remove(port));
};

listenerService.getAll = function () {
	return listeners;
};

function createServer (port, app) {
	const server = http.Server(app);
	server.listen(port);
	enableDestroy(server);
	return server;
}

module.exports = listenerService;
