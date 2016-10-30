const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const _ = require('lodash');
const enableDestroy = require('server-destroy');
const listeners = {};

function addListener (port) {
	if (listeners[port]) {
		throw new Error(`Listener already exists: ${port}`);
	}

	const app = express();
	app.use(bodyParser.json());
	app.use((req, res, next) => {
		const port = req.headers.host.substr(req.headers.host.indexOf(':') + 1);
		console.log(reqFm(req.method, port, req.originalUrl), '(Incoming)');
		next();
	});

	const server = http.Server(app);

	server.listen(port);
	console.log(`Added listener on port ${port}`);
	enableDestroy(server);
	listeners[port] = { app, server, routes: {} };
	return listeners[port];
}

function sendChunk (port, route, chunk) {
	const listener = listeners[port];
	if (!listener) {
		throw new Error('No listener exists on ' + port);
	}

	const routeObj = listener.routes[route];
	if (!routeObj) {
		throw new Error(`Route does not exist ${port}/${route}`);
	}

	routeObj.clients.forEach(client => client.write(chunk));
	routeObj.chunks.push(chunk);
	console.log('Chunk sent to', reqFm(routeObj.method, port, route));
}

function addRoute (port, method, route, response) {
	let listener = listeners[port];
	if (!listener) {
		listener = addListener(port);
		console.log(`No listener exists on ${port}. Adding listener`);
	}

	if (listener.routes[route]) {
		throw new Error(`Route already exists: ${route}`);
	}

	listener.routes[route] = {
		method: method,
		response: response,
		clients: [],
		chunks: []
	};

	console.log('Added route', reqFm(method, port, route));
	listener.app[method](route, (req, res) => {
		if (response) {
			console.log(reqFm(req.method, port, req.originalUrl), `(Response: ${response.statusCode})`);
			res.set(response.headers);
			res.status(response.statusCode).send(response.body);
		} else {
			console.log(reqFm(req.method, port, req.originalUrl), '(Keep-Alive)');
			req.on('close', () => _.pull(listener.routes[route].clients, res)); // Remove listener
			listener.routes[route].clients.push(res); // Add listener
			listener.routes[route].chunks.forEach(chunk => res.write(chunk)); // Replay buffered chunks
		}
	});
}

function getListener (port) {
	const listener = listeners[port];
	if (!listener) {
		throw new Error('No listener exists on ' + port);
	}

	return _.mapValues(listener.routes, route => {
		route.clients = route.clients.length;
		return route;
	});
}

function getListeners () {
	return _.mapValues(listeners, (listener, port) => {
		return getListener(port);
	});
}

function removeListener (port) {
	if (!listeners[port]) {
		throw new Error('No listener exists on ' + port);
	}

	listeners[port].server.destroy();
	delete listeners[port];
	console.log('Removed listener for', port);
}

function removeListeners () {
	Object.keys(listeners).forEach(removeListener);
}

function reqFm (method, port, route, statusCode = '') {
	return `${method.toUpperCase()} localhost:${port}${route} ${statusCode}`;
}

module.exports = {
	addListener,
	addRoute,
	getListener,
	getListeners,
	removeListeners,
	removeListener,
	sendChunk
};
