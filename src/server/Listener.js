const _ = require('lodash');
const httpProxy = require('http-proxy');
const requestService = require('./requestService');

class Listener {
	constructor ({ port, app, server }) {
		this.port = port;
		this.routes = {};
		this.app = app;
		this.server = server;
	}

	get (uri, method) {
		return _.get(this.routes[uri], method);
	}

	add (uri, method, options) {
		this.routes[uri] = this.routes[uri] || {};
		this.routes[uri][method] = {
			options: options,
			clients: [],
			chunks: []
		};

		const routeHandler = this.getRouteHandler(options);
		this.app[method.toLowerCase()](uri, routeHandler);
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
			return this.getSimpleRouteHandler(options);
		} else if (options.handler) {
			return this.getDynamicRouteHandler(options);
		} else if (options.proxy) {
			return this.getProxyRouteHandler(options);
		} else {
			return this.getStreamingRouteHandler(options);
		}
	}

	getSimpleRouteHandler (options) {
		const {uri, response, method, headers = {}, statusCode = 200} = options;
		console.log('Added route', reqFm(method, this.port, uri));
		return (req, res) => {
			requestService.addRequest(req, 'simple');
			console.log(reqFm(req.method, this.port, req.originalUrl), `(Response: ${statusCode})`);
			res.set(headers);
			res.status(statusCode).send(response);
		};
	}

	getDynamicRouteHandler (options) {
		const { uri, method, handler } = options;
		console.log('Added dynamic route', reqFm(method, this.port, uri));
		return handler;
	}

	getProxyRouteHandler (options) {
		const srcPort = this.port;
		const { uri, method } = options;
		const targetPort = options.proxy.target.substring(options.proxy.target.lastIndexOf(':') + 1);
		const proxy = httpProxy.createProxyServer(options.proxy);

		console.log(`Added proxy route ${reqFm(method, srcPort, uri)} -> ${reqFm(method, targetPort, uri)}`);
		return (req, res) => {
			requestService.addRequest(req, 'proxy');
			console.log(`${reqFm(req.method, srcPort, req.url)} -> ${reqFm(req.method, targetPort, req.url)} (Proxying)`);
			proxy.web(req, res, e => {
				console.error(e);
				res.statusCode = 500;
				res.end(e.message);
			});
		};
	}

	getStreamingRouteHandler (options) {
		const { uri, method } = options;

		console.log('Added streaming route', reqFm(method, this.port, uri));
		return (req, res) => {
			requestService.addRequest(req, 'streaming');
			console.log(reqFm(req.method, this.port, req.originalUrl), '(Streaming)');
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
	return `${method.toUpperCase()} localhost:${port}${uri} ${statusCode}`;
}

module.exports = Listener;
