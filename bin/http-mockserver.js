#!/usr/bin/env node
const mockServer = require('../src/server/index.js');
const yargs = require('yargs');

const argv = yargs
	.usage('Usage: $0 [options]')
	.demand(1)
	.example('$0 --mocks=./mocks')

	.option('mocks', {
		alias: 'm',
		describe: 'Path to mock configs',
		type: 'string'
	})

	.option('port', {
		alias: 'p',
		describe: 'MockServer port',
		type: 'number',
		default: 3000
	})

	.alias('v', 'version')
	.version(require('../package').version)

	.help('help')
	.demand(0)
	.argv;

if (argv.mocks) {
	mockServer.addMocksByPath(argv.mocks);
}

mockServer.start(argv.port);
