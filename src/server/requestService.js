const crypto = require('crypto');
const _ = require('lodash');

const requests = [];
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

requestService.getRequests = function (port, type) {
	let output = requests;
	if (port) {
		output = output.filter(req => req.req.port === port);
	}

	if (type) {
		output = output.filter(req => req.type === type);
	}

	return output;
};

requestService.clear = function () {
	requests.splice(0, requests.length);
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
