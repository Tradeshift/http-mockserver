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

listenerService.addRoute = function (port, options) {
	if (!options.method) {
		throw new Error(`"method" required. port=${port} uri=${options.uri}`);
	}

	if (!options.uri) {
		throw new Error(`"uri" required. port=${port}`);
	}

	const listener = listeners[port] || listenerService.addListener(port);
	const hasRoute = listener.get(options.uri, options.method);
	if (hasRoute) {
		console.log(`Overwriting route: ${options.method} http://localhost:${port}${options.uri}`);
	}

	listener.add(options.uri, options.method, options);
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
