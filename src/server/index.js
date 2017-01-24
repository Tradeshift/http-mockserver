const Q = require('q');
const listenerService = require('./listenerService');
const expressServer = require('./expressServer');
const mockFileReader = require('./mockFileReader');

const mockServer = {};
const promises = [];

mockServer.start = (port = 3000) => {
	const promise = Q.Promise((resolve) => {
		expressServer.listen(port, () => {
			console.log(`Running http-mockserver on http://localhost:${port}`);
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

mockServer.addMocks = (filePath) => {
	const promise = mockFileReader.addMocks(filePath);
	promises.push(promise);
	return mockServer;
};

mockServer.isReady = () => {
	return Q.all(promises);
};

module.exports = mockServer;
