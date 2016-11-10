const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const _ = require('lodash');
const enableDestroy = require('server-destroy');
const httpProxy = require('http-proxy');
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

	console.log(`Added listener on port ${port}`);
	return createServer(port, app);
}

function createServer (port, app) {
	const server = http.Server(app);
	server.listen(port);
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
	console.log('Chunk sent to', reqFm(routeObj.options.method, port, route));
}

function addRoute (port, options) {
	let listener = listeners[port];
	if (!listener) {
		listener = addListener(port);
	}

	if (listener.routes[options.route]) {
		throw new Error(`Route already exists: ${options.route}`);
	}

	listener.routes[options.route] = {
		options: options,
		clients: [],
		chunks: []
	};

	const routeHandler = getRouteHandler(port, options);
	listener.app[options.method.toLowerCase()](options.route, routeHandler);
}

function getRouteHandler (port, options) {
	if (options.response) {
		return getSimpleRouteHandler(port, options);
	} else if (options.proxy) {
		return getProxyRouteHandler(port, options);
	} else {
		return getStreamingRouteHandler(port, options);
	}
}

function getSimpleRouteHandler (port, options) {
	const route = options.route;
	const response = options.response;
	const method = options.method;

	console.log('Added route', reqFm(method, port, route));
	return (req, res) => {
		console.log(reqFm(req.method, port, req.originalUrl), `(Response: ${response.statusCode})`);
		res.set(response.headers);
		res.status(response.statusCode).send(response.body);
	};
}

function getProxyRouteHandler (srcPort, options) {
	const route = options.route;
	const method = options.method;
	const targetPort = options.proxy.target.substring(options.proxy.target.lastIndexOf(':') + 1);
	const proxy = httpProxy.createProxyServer(options.proxy);

	console.log(`Added proxy route ${reqFm(method, srcPort, route)} -> ${reqFm(method, targetPort, route)}`);
	return (req, res) => {
		console.log(`${reqFm(req.method, srcPort, req.url)} -> ${reqFm(req.method, targetPort, req.url)} (Proxying)`);
		proxy.web(req, res, e => {
			console.error(e);
			res.statusCode = 500;
			res.end(e.message);
		});
	};
}

function getStreamingRouteHandler (port, options) {
	const listener = listeners[port];
	const route = options.route;
	const method = options.method;

	console.log('Added streaming route', reqFm(method, port, route));
	return (req, res) => {
		console.log(reqFm(req.method, port, req.originalUrl), '(Streaming)');
		req.on('close', () => _.pull(listener.routes[route].clients, res)); // Remove listener
		listener.routes[route].clients.push(res); // Add listener
		listener.routes[route].chunks.forEach(chunk => res.write(chunk)); // Replay buffered chunks
	};
}

function getListener (port) {
	const listener = listeners[port];
	if (!listener) {
		throw new Error('No listener exists on ' + port);
	}
	return _.mapValues(listener.routes, route => {
		route.clientsCount = route.clients.length;
		return _.omit(route, 'clients');
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
	removeListener,
	removeListeners,
	sendChunk
};
