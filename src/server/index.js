const Q = require('q');
const listenerService = require('./listenerService');
const requestLogService = require('./requestLogService');
const expressServer = require('./expressServer');
const mockFileReader = require('./mockFileReader');
const logService = require('./logService');
const MockServerFactory = require('../both/MockServerFactory');

const mockServer = {};
const promises = [];

mockServer.start = (port = 3000) => {
	const promise = Q.Promise((resolve) => {
		expressServer.listen(port, () => {
			logService.info(`Running http-mockserver on http://localhost:${port}`);
			resolve();
		});
	});
	promises.push(promise);
	return mockServer.isReady();
};

mockServer.stop = () => {
	listenerService.clear();
	expressServer.close();
};

mockServer.enableDebug = function () {
	logService.enableDebug();
};

mockServer.getListener = function (port) {
	return listenerService.getListener(port);
};

mockServer.addListener = function (port) {
	listenerService.addListener(port);
};

mockServer.removeListener = function (port) {
	listenerService.removeListener(port);
};

mockServer.getRequests = function (port) {
	return requestLogService.getEntries(port);
};

mockServer.waitForRequest = function (port, predicate, count = 1, delay = 500) {
	const requests = mockServer.getRequests(port).filter(predicate);

	if (requests.length === count) {
		return Q(requests);
	}

	return Q.delay(delay).then(() => mockServer.waitForRequest(port, predicate, count, delay));
};

mockServer.addMock = function (mockConfig) {
	listenerService.addMock(mockConfig);
};

mockServer.addMocks = function (...mocks) {
	return Q.all(mocks.map(mockServer.addMock));
};

mockServer.addMocksByPath = (filePath) => {
	const promise = mockFileReader.addMocks(filePath);
	promises.push(promise);
	return mockServer;
};

mockServer.sendData = function (port, options) {
	const uri = options.uri;
	const chunk = options.data;
	listenerService.sendChunk(port, uri, chunk);
};

mockServer.clearAll = function () {
	listenerService.clear();
	requestLogService.clear();
};

mockServer.create = function (port) {
	return new MockServerFactory(port, mockServer);
};

mockServer.isReady = () => {
	return Q.all(promises);
};

module.exports = mockServer;
