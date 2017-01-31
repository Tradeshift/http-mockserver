class MockClient {
	constructor (port, clientService) {
		this.clientService = clientService;
		this.port = port;
	}

	isListening () {
		return this.clientService.isListening(this.port);
	}

	getListener () {
		return this.clientService.getListener(this.port);
	}

	addListener () {
		return this.clientService.addListener(this.port);
	}

	removeListener () {
		return this.clientService.removeListener(this.port);
	}

	getRequests () {
		return this.clientService.getRequests(this.port);
	}

	waitForRequest (...args) {
		return this.clientService.waitForRequest(this.port, ...args);
	}

	addMock (options) {
		options.port = this.port;
		return this.clientService.addMock(options);
	}

	addMocks (...args) {
		return this.addMocks(...args);
	}

	sendData (options) {
		return this.clientService.sendData(this.port, options);
	}
}

module.exports = MockClient;
