const Q = require('q');
const _ = require('lodash');
const { format } = require('url');
const request = Q.denodeify(require('request'));

let serverHost;

class MockClient {

	constructor (port, debugMode) {
		this.debugMode = debugMode;
		this.port = port;
	}

	isListening () {
		return this.getListener(this.port)
			.then(response => response.statusCode === 200);
	}

	getListener () {
		return req({
			uri: '/listener/' + this.port,
			method: 'GET'
		});
	}

	addListener () {
		return req({
			uri: '/listener/' + this.port,
			method: 'POST'
		});
	}

	getRequests () {
		return req({
			uri: '/requests/' + this.port,
			method: 'GET'
		})
		.then(res => JSON.parse(res.body));
	}

	waitForRequest (predicate, count = 1, delay = 500) {
		return this.getRequests()
			.then(requests => requests.filter(predicate))
			.then(requests => {
				if (requests.length === count) {
					return requests;
				} else {
					return Q.delay(delay).then(() => this.waitForRequest(predicate, count, delay));
				}
			});
	}

	removeListener () {
		return req({
			uri: '/listener/' + this.port,
			method: 'DELETE'
		});
	}

	allowAll () {
		return this.addMock({
			uri: '*',
			method: 'GET',
			response: {}
		});
	}

	addMock (options) {
		options.port = this.port;
		this.log('Adding mock', options);
		return req({
			uri: '/mocks/',
			method: 'POST',
			json: options
		});
	}

	addMocks (...mocks) {
		return Q.all(mocks.map(mock => this.addMock(mock)));
	}

	sendData (options) {
		return req({
			uri: '/listener/' + this.port + '/chunk',
			method: 'POST',
			json: options
		});
	}

	log (...args) {
		if (this.debugMode) {
			console.log.apply(console, args);
		}
	}

	static clearAll () {
		return req({
			uri: '/clear',
			method: 'DELETE'
		});
	}
}

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

module.exports = (_serverHost = 'localhost:3000') => {
	serverHost = _serverHost;
	return MockClient;
};
