const _ = require('lodash');
const bodyParser = require('body-parser');
const enableDestroy = require('server-destroy');
const express = require('express');
const http = require('http');
const httpProxy = require('http-proxy');
const requestLogService = require('./requestLogService');

class Listener {
	// Create new listener
	constructor (port) {
		const app = express();
		app.use(bodyParser.json());
		app.use((req, res, next) => {
			requestLogService.addEntry(req, res);
			next();
		});

		console.log(`Added listener on port ${port}`);

		this.port = port;
		this.routes = {};
		this.app = app;
		this.server = createServer(port, app);
	}

	// Get route
	get (uri, method) {
		return _.get(this.routes[uri], method);
	}

	// Add route
	add (uri, method, options) {
		this.routes[uri] = this.routes[uri] || {};

		// Register route if it hasn't been registered before
		if (!this.routes[uri][method]) {
			this.app[method.toLowerCase()](uri, (req, res) => {
				return this.routes[uri][method].handler(req, res);
			});
		}

		this.routes[uri][method] = {
			options: options,
			clients: [],
			chunks: [],
			handler: this.getRouteHandler(options)
		};
	}

	destroy () {
		this.server.destroy();
	}

	sendChunk (uri, chunk) {
		const route = this.get(uri, 'GET');
		if (!route) {
			throw new Error(`Route does not exist ${this.port}/${uri}`);
		}

		route.clients.forEach(client => client.write(chunk));
		route.chunks.push(chunk);
		console.log('Chunk sent to', reqFm(route.options.method, this.port, uri));
	}

	getRouteHandler (options) {
		if (options.response) {
			return this.getStaticRouteHandler(options);
		} else if (options.handler) {
			return this.getDynamicRouteHandler(options);
		} else if (options.proxy) {
			return this.getProxyRouteHandler(options);
		} else {
			return this.getStreamingRouteHandler(options);
		}
	}

	// Returns static response
	getStaticRouteHandler (options) {
		const {uri, response, method} = options;
		const statusCode = response.statusCode || 200;
		console.log(reqFm(method, this.port, uri), '(static)');
		return (req, res) => {
			requestLogService.setEntryType(req.id, 'static');
			res.set(response.headers);
			res.status(statusCode).send(response.body);
		};
	}

	// Returns dynamic handler that can change the response depending on the request
	getDynamicRouteHandler (options) {
		const { uri, method, handler } = options;
		console.log(reqFm(method, this.port, uri), '(dynamic)');
		return (req, res) => {
			requestLogService.setEntryType(req.id, 'dynamic');
			return handler(req, res);
		};
	}

	// Proxies the request to another route
	getProxyRouteHandler (options) {
		const srcPort = this.port;
		const { uri, method } = options;
		const targetPort = options.proxy.target.substring(options.proxy.target.lastIndexOf(':') + 1);
		const proxy = httpProxy.createProxyServer(options.proxy);

		console.log(`${reqFm(method, srcPort, uri)} -> ${reqFm(method, targetPort, uri)}`, '(proxy)');
		return (req, res) => {
			requestLogService.setEntryType(req.id, 'proxy');
			proxy.web(req, res, e => {
				console.error(e);
				res.statusCode = 500;
				res.end(e.message);
			});
		};
	}

	// Returns a "keep-alive" response which can transport chunked responses
	getStreamingRouteHandler (options) {
		const { uri, method } = options;

		console.log(reqFm(method, this.port, uri), '(streaming)');
		return (req, res) => {
			requestLogService.setEntryType(req.id, 'streaming');
			const route = this.get(uri, method);
			req.on('close', () => _.pull(route.clients, res)); // Remove listener
			route.clients.push(res); // Add listener
			route.chunks.forEach(chunk => res.write(chunk)); // Replay buffered chunks
		};
	}

	toString () {
		return _.mapValues(this.routes, (routes, uri) => {
			return _.mapValues(routes, (route, method) => {
				route.clientsCount = route.clients.length;
				return _.omit(route, 'clients');
			});
		});
	}
}

function reqFm (method, port, uri, statusCode = '') {
	return `${method.toUpperCase()} http://localhost:${port}${uri} ${statusCode}`;
}

function createServer (port, app) {
	const server = http.Server(app);
	server.listen(port);
	enableDestroy(server);
	return server;
}

module.exports = Listener;
