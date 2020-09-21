const _ = require('lodash');
const bodyParser = require('body-parser');
const enableDestroy = require('server-destroy');
const express = require('express');
const http = require('http');
const httpProxy = require('http-proxy');
const requestLogService = require('./requestLogService');
const logService = require('./logService');
const pathRegexp = require('path-to-regexp');
const xmlparser = require('express-xml-bodyparser');

class Listener {
	// Create new listener
	constructor (port) {
		const app = express();
		app.use(bodyParser.json({
			strict: false
		}));
		app.use(bodyParser.text());
		app.use(xmlparser({trim: false, explicitArray: false}));
		app.use((req, res, next) => {
			requestLogService.addEntry(req, res);
			next();
		});

		logService.info(`Added listener on port ${port}`);

		this.port = port;
		this.mocks = {};
		this.app = app;
		this.server = createServer(port, app);
	}

	// Get mock
	get (uri, method) {
		return _.chain(this.mocks)
			.find((mock, mockUri) => {
				return pathRegexp(mockUri, []).exec(uri);
			})
			.get(method)
			.value();
	}

	// Add mock
	add (options) {
		const {uri, method} = options;
		this.mocks[uri] = this.mocks[uri] || {};
		const oldMock = this.mocks[uri][method];
		if (oldMock) {
			// close pending requests
			oldMock.clients.forEach(client => client.end());
		}
		this.mocks[uri][method] = {
			options: options,
			clients: [],
			chunks: [],
			handler: this.getMockHandler(options)
		};

		// Register mock if it hasn't been registered before
		if (!oldMock) {
			this.app[method.toLowerCase()](uri, (req, res) => {
				return this.mocks[uri][method].handler(req, res);
			});
		}
	}

	destroy () {
		this.server.destroy();
	}

	sendChunk (uri, chunk) {
		const mock = this.get(uri, 'GET');
		if (!mock) {
			throw new Error(`Mock does not exist ${this.port}/${uri}`);
		}

		mock.clients.forEach(client => client.write(chunk));
		mock.chunks.push(chunk);
		logService.info('Chunk sent to', reqFm(mock.options.method, this.port, uri));
	}

	getMockHandler (options) {
		if (options.response) {
			return this.getStaticMockHandler(options);
		} else if (options.handler) {
			return this.getDynamicMockHandler(options);
		} else if (options.proxy) {
			return this.getProxyMockHandler(options);
		} else {
			return this.getStreamingMockHandler(options);
		}
	}

	// Returns static response
	getStaticMockHandler (options) {
		const {uri, response, method} = options;
		const statusCode = response.statusCode || 200;
		logService.info(reqFm(method, this.port, uri), '(static)');
		return (req, res) => {
			const body = replaceBodyPlaceholders(req, response.body);
			requestLogService.setEntryType(req.id, 'static');
			res.set(response.headers);
			res.status(statusCode).send(body);
		};
	}

	// Returns dynamic handler that can change the response depending on the request
	getDynamicMockHandler (options) {
		const { uri, method, handler } = options;
		logService.info(reqFm(method, this.port, uri), '(dynamic)');
		return (req, res) => {
			requestLogService.setEntryType(req.id, 'dynamic');
			return handler(req, res);
		};
	}

	// Proxies the request to another mock
	getProxyMockHandler (options) {
		const srcPort = this.port;
		const { uri, method } = options;
		const targetPort = options.proxy.target.substring(options.proxy.target.lastIndexOf(':') + 1);
		const proxy = httpProxy.createProxyServer(options.proxy);

		logService.info(`${reqFm(method, srcPort, uri)} -> ${reqFm(method, targetPort, uri)}`, '(proxy)');
		return (req, res) => {
			requestLogService.setEntryType(req.id, 'proxy');
			proxy.web(req, res, e => {
				logService.error(e);
				res.statusCode = 500;
				res.end(e.message);
			});
		};
	}

	// Returns a "keep-alive" response which can transport chunked responses
	getStreamingMockHandler (options) {
		const { uri, method } = options;

		logService.info(reqFm(method, this.port, uri), '(streaming)');
		return (req, res) => {
			requestLogService.setEntryType(req.id, 'streaming');
			const mock = this.get(uri, method);
			req.on('close', () => _.pull(mock.clients, res)); // Remove listener
			mock.clients.push(res); // Add listener
			mock.chunks.forEach(chunk => res.write(chunk)); // Replay buffered chunks
		};
	}

	toString () {
		return _.mapValues(this.mocks, (mocks, uri) => {
			return _.mapValues(mocks, (mock, method) => {
				mock.clientsCount = mock.clients.length;
				return _.omit(mock, 'clients');
			});
		});
	}
}

function replaceBodyPlaceholders (req, body) {
	const isJSObject = _.isObject(body) && !Buffer.isBuffer(body);
	if (!isJSObject && !_.isString(body)) {
		return;
	}

	const regex = /\${req\.([\w.]+)}/g;
	body = isJSObject ? JSON.stringify(body) : body;
	body = body.replace(regex, (match, props) => _.get(req, props));
	return isJSObject ? JSON.parse(body) : body;
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
