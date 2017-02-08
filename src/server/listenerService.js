const _ = require('lodash');
const Listener = require('./Listener');
const logService = require('./logService');

const listeners = {};
const listenerService = {};

listenerService.getListener = function (port) {
	const listener = listeners[port];
	if (!listener) {
		throw new Error(`Can't get listener. No listener exists on ${port}`);
	}
	return listener;
};

listenerService.addListener = function (port) {
	if (listeners[port]) {
		throw new Error(`Listener already exists: ${port}`);
	}

	const listener = new Listener(port);
	listeners[port] = listener;
	return listener;
};

listenerService.addMock = function (options) {
	options = _.defaultsDeep({}, options, {
		method: 'get',
		bodyParsers: {
			json: {
				strict: false
			},
			text: {}
		}
	});
	options.method = options.method.toLowerCase();

	const {port, method, uri} = options;
	if (!port || !uri) {
		throw new Error(`"port" and "uri" are required. options=${options}`);
	}

	const listener = listeners[port] || listenerService.addListener(port);
	const hasMock = listener.get(uri, method);
	if (hasMock) {
		logService.info(`Overwriting mock: ${method} http://localhost:${port}${options.uri}`);
	}

	listener.add(options);
};

listenerService.removeListener = function (port) {
	if (!listeners[port]) {
		throw new Error(`Can't remove listener. No listener exists on ${port}`);
	}

	listeners[port].destroy();
	delete listeners[port];
	logService.info('Removed listener for', port);
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
	Object.keys(listeners).forEach(port => listenerService.removeListener(port));
};

listenerService.getAll = function () {
	return listeners;
};

module.exports = listenerService;
