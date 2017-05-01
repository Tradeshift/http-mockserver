const Q = require('q');
const _ = require('lodash');
const { format } = require('url');
const request = Q.denodeify(require('request'));
const MockServerFactory = require('../both/MockServerFactory');

let serverHost = 'localhost:3000';
let isDebugEnabled = false;

const clientService = {};
clientService.setServerHost = function (_serverHost) {
	serverHost = _serverHost;
};

clientService.enableDebug = function () {
	isDebugEnabled = true;
};

clientService.getListener = function (port) {
	return req({
		uri: '/listener/' + port,
		method: 'GET'
	});
};

clientService.addListener = function (port) {
	return req({
		uri: '/listener/' + port,
		method: 'POST'
	});
};

clientService.removeListener = function (port) {
	return req({
		uri: '/listener/' + port,
		method: 'DELETE'
	});
};

clientService.getRequests = function (port) {
	return req({
		uri: '/requests/' + port,
		method: 'GET'
	})
	.then(res => JSON.parse(res.body));
};

clientService.waitForRequest = function (port, predicate, count = 1, delay = 500) {
	return clientService.getRequests(port)
		.then(requests => requests.filter(predicate))
		.then(requests => {
			if (requests.length === count) {
				return requests;
			}

			return Q.delay(delay).then(() => clientService.waitForRequest(port, predicate, count, delay));
		});
};

clientService.addMock = function (options) {
	log('Adding mock', options);
	return req({
		uri: '/mocks/',
		method: 'POST',
		json: options
	});
};

clientService.sendData = function (port, options) {
	return req({
		uri: '/listener/' + port + '/chunk',
		method: 'POST',
		json: options
	});
};

clientService.clearAll = function () {
	return req({
		uri: '/clear',
		method: 'DELETE'
	});
};

clientService.create = function (port) {
	return new MockServerFactory(port, clientService);
};

function log (...args) {
	if (isDebugEnabled) {
		console.log(...args);
	}
};

function req (options) {
	options.baseUrl = format({
		protocol: 'http',
		host: serverHost
	});

	return request(options).spread((response) => {
		if (_.inRange(response.statusCode, 400, 600)) {
			throw new Error(`Request failed: options=${JSON.stringify(options)}, response=${response.body}`);
		}
		return response;
	});
}

module.exports = clientService;
