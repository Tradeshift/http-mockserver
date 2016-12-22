#!/usr/bin/env node
const startMockServer = require('../src/server/index.js');
const configInitializer = require('./configInitializer');
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

	.help('help')
	.demand(0)
	.argv;

if (argv.mocks) {
	configInitializer.registerRoutes(argv.mocks);
}

startMockServer(argv.port);
