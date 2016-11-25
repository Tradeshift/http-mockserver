const service = require('./service');
const controller = {};

controller.getListener = (req, res) => {
	const listener = service.getListener(req.params.port);
	res.send(JSON.stringify(listener));
};

controller.addListener = (req, res) => {
	service.addListener(req.params.port);
	res.sendStatus(200);
};

controller.removeListener = (req, res) => {
	service.removeListener(req.params.port);
	res.sendStatus(200);
};

controller.addRoute = (req, res) => {
	const port = req.params.port;
	const options = req.body;

	if (!options.method) {
		throw new Error('"method" required');
	}

	if (!options.route) {
		throw new Error('"route" required');
	}

	service.addRoute(port, options);
	res.sendStatus(200);
};

controller.sendChunk = (req, res) => {
	const port = req.params.port;
	const route = req.body.route;
	const chunk = Buffer.from(req.body.data, 'base64');

	if (!route) {
		throw new Error('"route" required');
	}

	service.sendChunk(port, route, chunk);
	res.sendStatus(200);
};

controller.getListeners = (req, res) => {
	const listeners = service.getListeners();
	res.send(JSON.stringify(listeners));
};

controller.removeListeners = (req, res) => {
	service.removeListeners();
	res.sendStatus(200);
};

module.exports = controller;
