const fs = require('fs');
const path = require('path');
const readDir = require('recursive-readdir');
const listenerService = require('../src/server/listenerService.js');

const configInitializer = {};

function readConfigs (dirname, cb) {
	readDir(dirname, (err, filenames) => {
		if (err) {
			console.log(err);
			return;
		}

		filenames
			.filter(filename => ['.json', '.js'].includes(path.extname(filename)))
			.forEach((filename) => readConfig(filename, cb));
	});
}

function readConfig (filename, cb) {
	const resolvedPath = path.resolve(filename);
	try {
		const file = require(resolvedPath);
		cb(filename, file);
	} catch (e) {
		console.log(`Error with mock ${resolvedPath}`, e);
	}
}

function registerMock (filename, fileContent) {
	switch (path.extname(filename)) {
		case '.json': return registerStaticMocks(filename, fileContent);
		case '.js': return registerDynamicMocks(filename, fileContent);
	}
}

function registerStaticMocks (filename, config) {
	return listenerService.addRoute(config.port, config);
}

function registerDynamicMocks (filename, handler) {
	return handler(config => {
		return listenerService.addRoute(config.port, config);
	});
}

configInitializer.registerMocks = function (mockPath) {
	const isDir = fs.lstatSync(mockPath).isDirectory();
	if (isDir) {
		readConfigs(mockPath, registerMock);
	} else {
		readConfig(mockPath, registerMock);
	}
};

module.exports = configInitializer;
