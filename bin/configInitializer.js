const fs = require('fs');
const path = require('path');
const readDir = require('recursive-readdir');
const listenerService = require('../src/server/listenerService.js');

const configInitializer = {};

configInitializer.readConfigs = function (dirname, cb) {
	readDir(dirname, (err, filenames) => {
		if (err) {
			console.log(err);
			return;
		}

		filenames
			.filter(filename => ['.json', '.js'].includes(path.extname(filename)))
			.forEach((filename) => readConfig(filename, cb));
	});
};

function readConfig (filename, cb) {
	const resolvedPath = path.resolve(filename);
	try {
		const file = require(resolvedPath);
		cb(filename, file);
	} catch (e) {
		console.log(`Could not read file ${resolvedPath}`, e);
	}
}

function registerMock (filename, configFile) {
	switch (path.extname(filename)) {
		case '.json': return listenerService.addRoute(configFile.port, configFile);
		case '.js': return configFile(listenerService.addRoute);
	}
}

configInitializer.registerMocks = function (mockPath) {
	const isDir = fs.lstatSync(mockPath).isDirectory();
	if (isDir) {
		configInitializer.readConfigs(mockPath, registerMock);
	} else {
		readConfig(mockPath, (filename, configFile) => registerMock(filename, configFile));
	}
};

module.exports = configInitializer;
