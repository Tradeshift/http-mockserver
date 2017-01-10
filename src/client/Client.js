const Q = require('q');
const _ = require('lodash');
const { format } = require('url');
const request = Q.denodeify(require('request'));

class MockClient {

	constructor (port, serverHost) {
		this.port = port;
		this.serverHost = serverHost;
	}

	isListening () {
		return this.getListener(this.port)
			.then(response => response.statusCode === 200);
	}

	getListener () {
		return this.req({
			uri: '/listener/' + this.port,
			method: 'GET'
		});
	}

	listen () {
		return this.req({
			uri: '/listener/' + this.port,
			method: 'POST'
		});
	}

	getRequests () {
		return this.req({
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
		return this.req({
			uri: '/listener/' + this.port,
			method: 'DELETE'
		});
	}

	clear () {
		return this.req({
			uri: '/clear',
			method: 'DELETE'
		});
	}

	allowAll () {
		return this.addRoute({
			uri: '*',
			method: 'GET',
			response: {}
		});
	}

	addRoute (options) {
		return this.req({
			uri: '/listener/' + this.port,
			method: 'POST',
			json: options
		});
	}

	addRoutes (...routes) {
		return Q.all(routes.map(options => this.addRoute(options)));
	}

	sendData (options) {
		return this.req({
			uri: '/listener/' + this.port + '/chunk',
			method: 'POST',
			json: options
		});
	}

	req (options) {
		options.baseUrl = format({
			protocol: 'http',
			host: this.serverHost
		});

		return request(options).spread((response, body) => {
			if (_.inRange(response.statusCode, 400, 600)) {
				throw new Error(`Request failed: ${request.method} ${request.href} with status=${response.statusCode}, body=${body}`);
			}
			return response;
		});
	}
}

module.exports = MockClient;
