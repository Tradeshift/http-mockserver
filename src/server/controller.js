const _ = require('lodash');
const listenerService = require('./listenerService');
const requestService = require('./requestService');
const controller = {};

controller.addListenerOrRoute = (req, res) => {
	const port = req.params.port;
	const options = req.body;

	if (_.isEmpty(options)) {
		listenerService.addListener(port);
	} else {
		if (!options.method) {
			throw new Error(`"method" required. port=${port} uri=${options.uri}`);
		}

		if (!options.uri) {
			throw new Error(`"uri" required. port=${port}`);
		}

		listenerService.addRoute(port, options);
	}

	res.sendStatus(200);
};

controller.removeListener = (req, res) => {
	listenerService.remove(req.params.port);
	res.sendStatus(200);
};

controller.sendChunk = (req, res) => {
	const port = req.params.port;
	const uri = req.body.uri;
	const chunk = Buffer.from(req.body.data, 'base64');

	if (!uri) {
		throw new Error('"uri" required');
	}

	listenerService.sendChunk(port, uri, chunk);
	res.sendStatus(200);
};

controller.getListeners = (req, res) => {
	const port = parseInt(req.params.port, 10);
	if (!port) {
		const listeners = _.mapValues(listenerService.getAll(), (listener, port) => listener.toString());
		res.json(listeners).end();
		return;
	}

	const listener = listenerService.get(port);
	res.json(listener.toString());
};

controller.clear = (req, res) => {
	listenerService.clear();
	requestService.clear();
	res.sendStatus(200);
};

controller.getRequests = (req, res) => {
	const port = parseInt(req.params.port, 10);
	const type = req.query.type;
	const requests = requestService.getRequests(port, type);
	res.json(requests);
};

module.exports = controller;
