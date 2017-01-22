const Listener = require('./Listener');

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

listenerService.addRoute = function (options) {
	const port = options.port;
	if (!options.port || !options.method || !options.uri) {
		throw new Error(`"port", "method" and "uri" required. options=${options}`);
	}

	const listener = listeners[port] || listenerService.addListener(port);
	const hasRoute = listener.get(options.uri, options.method);
	if (hasRoute) {
		console.log(`Overwriting route: ${options.method} http://localhost:${port}${options.uri}`);
	}

	listener.add(options);
};

listenerService.removeListener = function (port) {
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
	Object.keys(listeners).forEach(port => listenerService.removeListener(port));
};

listenerService.getAll = function () {
	return listeners;
};

module.exports = listenerService;
