const expressServer = require('./expressServer');
const mockFileReader = require('./mockFileReader');

const mockServer = {};
mockServer.start = (port = 3000) => {
	expressServer.listen(port, () => {
		console.log(`Running http-mockserver on http://localhost:${port}`);
	});
};

mockServer.addMocks = (filePath) => {
	mockFileReader.addMocks(filePath);
	return mockServer;
};

module.exports = mockServer;
