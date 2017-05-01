class MockServerFactory {
	constructor (port, service) {
		this.service = service;
		this.port = port;
	}

	isListening () {
		return this.service.isListening(this.port);
	}

	getListener () {
		return this.service.getListener(this.port);
	}

	addListener () {
		return this.service.addListener(this.port);
	}

	removeListener () {
		return this.service.removeListener(this.port);
	}

	getRequests () {
		return this.service.getRequests(this.port);
	}

	waitForRequest (...args) {
		return this.service.waitForRequest(this.port, ...args);
	}

	addMock (options) {
		options.port = this.port;
		return this.service.addMock(options);
	}

	sendData (options) {
		return this.service.sendData(this.port, options);
	}
}

module.exports = MockServerFactory;
