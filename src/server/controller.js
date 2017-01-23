const _ = require('lodash');
const listenerService = require('./listenerService');
const requestLogService = require('./requestLogService');
const controller = {};

controller.addListener = (req, res) => {
	const port = req.params.port;
	listenerService.addListener(port);
	res.sendStatus(200);
};

controller.addMock = (req, res) => {
	const options = req.body;
	listenerService.addMock(options);
	res.sendStatus(200);
};

controller.removeListener = (req, res) => {
	listenerService.removeListener(req.params.port);
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

	const listener = listenerService.getListener(port);
	res.json(listener.toString());
};

controller.clear = (req, res) => {
	listenerService.clear();
	requestLogService.clear();
	res.sendStatus(200);
};

controller.getRequestLogs = (req, res) => {
	const port = parseInt(req.params.port, 10);
	const type = req.query.type;
	const logEntries = requestLogService.getEntries(port, type);
	res.json(logEntries);
};

module.exports = controller;
