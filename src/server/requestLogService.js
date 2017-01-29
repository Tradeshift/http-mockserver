const uuid = require('uuid/v4');
const _ = require('lodash');
const logService = require('./logService');

const entries = [];
const service = {};

service.addEntry = function (req, res) {
	req.id = uuid(); // Add unique id to request

	const entry = {
		id: req.id,
		req: {
			id: req.id,
			protocol: req.protocol,
			hostname: req.hostname,
			port: req.socket.localPort,
			uri: req.originalUrl,
			method: req.method,
			body: req.body,
			headers: req.headers
		},
		type: 'pending',
		time: Date.now()
	};
	entries.push(entry);

	// Intercept res.end method to get response body
	const endHandler = res.end;
	res.end = (...args) => {
		entry.res = {
			statusCode: res.statusCode,
			headers: res._headers,
			body: _.toString(args[0])
		};

		logService.info(reqFm(req.method, entry.req.port, req.originalUrl, res.statusCode));
		endHandler.apply(res, args);
	};
};

service.setEntryType = function (id, type) {
	const entry = _.find(entries, {type: 'pending', id: id});
	entry.type = type;
};

service.getEntries = function (port, type) {
	let items = entries;
	if (port) {
		items = items.filter(con => con.req.port === port);
	}

	if (type) {
		items = items.filter(con => con.type === type);
	}

	return items;
};

service.clear = function () {
	entries.splice(0, entries.length);
};

function reqFm (method, port, uri, statusCode = '') {
	return `${method.toUpperCase()} localhost:${port}${uri} ${statusCode}`;
}

module.exports = service;
