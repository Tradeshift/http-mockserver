const Q = require('q');
const fs = require('fs');
const path = require('path');
const readDir = require('recursive-readdir');
const listenerService = require('./listenerService.js');
const logService = require('./logService');

const mockFileReader = {};

function getFiles (dirname) {
	return Q.Promise((resolve, reject) => {
		readDir(dirname, (err, filenames) => {
			if (err) {
				reject(err);
				return;
			}

			const files = filenames
				.filter(filename => ['.json', '.js'].includes(path.extname(filename)))
				.map(getFile);

			resolve(files);
		});
	});
}

function getFile (filename) {
	try {
		return {
			name: filename,
			content: require(path.resolve(filename))
		};
	} catch (e) {
		logService.info(`Error loading ${filename}`, e);
		throw e;
	}
}

function parseFile (filename, mockConfigs) {
	mockConfigs = Array.isArray(mockConfigs) ? mockConfigs : [mockConfigs];

	try {
		mockConfigs.map(listenerService.addMock);
	} catch (e) {
		logService.info(`Error parsing ${filename}`, e);
	}
}

mockFileReader.addMocks = function (filePaths = []) {
	filePaths = Array.isArray(filePaths) ? filePaths : [filePaths];

	const promises = filePaths.map(filePath => {
		const isFile = fs.lstatSync(filePath).isFile();
		if (isFile) {
			const file = getFile(filePath);
			return parseFile(file.name, file.content);
		}

		return getFiles(filePath)
			.then(files => {
				return files.map(file => parseFile(file.name, file.content));
			})
			.catch(err => {
				logService.info(`Error loading files ${filePath}`, err);
			});
	});

	return Q.all(promises);
};

module.exports = mockFileReader;
