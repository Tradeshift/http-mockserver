const fs = require('fs');
const path = require('path');
const listenerService = require('../src/server/listenerService.js');

const configInitializer = {};

configInitializer.loadConfigs = function (dirname, onFileContent) {
	fs.readdir(dirname, (err, filenames) => {
		if (err) {
			console.log(err);
			return;
		}

		filenames
			.filter(filename => path.extname(filename) === '.json')
			.forEach((filename) => {
				fs.readFile(path.join(dirname, filename), 'utf-8', (err, content) => {
					if (err) {
						console.log(err);
						return;
					}
					onFileContent(filename, JSON.parse(content));
				});
			});
	});
};

configInitializer.registerRoutes = function (path) {
	configInitializer.loadConfigs(path, (filename, configFile) => {
		listenerService.addRoute(configFile.port, configFile);
	});
};

module.exports = configInitializer;
