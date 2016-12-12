const crypto = require('crypto');
const _ = require('lodash');

let requests = [];
const requestService = {};

requestService.addRequest = function (req, type) {
	const formattedReq = {
		protocol: req.protocol,
		hostname: req.hostname,
		port: req.socket.localPort,
		uri: req.originalUrl,
		method: req.method,
		body: req.body,
		headers: req.headers
	};

	const id = md5(JSON.stringify(formattedReq));
	removePendingRequest(id);

	requests.push({
		id: id,
		req: formattedReq,
		type,
		time: Date.now()
	});
};

requestService.getRequests = function (port) {
	if (!port) {
		return requests;
	}

	return requests.filter(req => req.req.port === port);
};

requestService.clear = function () {
	requests = [];
};

function removePendingRequest (id) {
	const pendingRequest = _.findIndex(requests, {type: 'pending', id: id});
	if (pendingRequest > -1) {
		_.pullAt(requests, [pendingRequest]);
	}
}

function md5 (data) {
	return crypto.createHash('md5').update(data).digest('hex');
}

module.exports = requestService;
