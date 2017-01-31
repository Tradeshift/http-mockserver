const Q = require('q');
const request = Q.denodeify(require('request'));
const {mockClient, mockServer} = require('../src/index');
const MOCKED_HOST_URI = 'http://localhost:4000';
const backendService = mockClient.create(4000);

describe('when adding mocks on the same uri', () => {
	beforeAll(() => mockServer.start());
	afterAll(mockServer.stop);

	it('should return first mock', done => {
		backendService.addMock({
			uri: '/duplicate-mock',
			method: 'GET',
			response: {
				body: 'First response'
			}
		})
		.then(() => {
			return request(`${MOCKED_HOST_URI}/duplicate-mock`).spread((response, body) => {
				expect(response.statusCode).toBe(200);
				expect(body).toBe('First response');
			});
		})
		.then(done, done.fail);
	});

	it('should return second mock', done => {
		backendService.addMock({
			uri: '/duplicate-mock',
			method: 'GET',
			response: {
				body: 'Second response'
			}
		})
		.then(() => {
			return request(`${MOCKED_HOST_URI}/duplicate-mock`).spread((response, body) => {
				expect(response.statusCode).toBe(200);
				expect(body).toBe('Second response');
			});
		})
		.then(done, done.fail);
	});
});

describe('when adding dynamic mock', () => {
	beforeAll(() => mockServer.start());
	afterAll(mockServer.stop);

	it('should dynamically update the response', () => {
		let counter = 0;
		mockServer.addMock({
			port: 2020,
			method: 'GET',
			uri: '/e2e-dynamic-mock',
			handler: function (req, res) {
				counter++;
				res.send(`Counter: ${counter}`);
			}
		});

		return request(`http://localhost:2020/e2e-dynamic-mock`).spread((response, body) => {
			expect(response.statusCode).toBe(200);
			expect(body).toBe('Counter: 1');
		})
		.then(() => {
			return request(`http://localhost:2020/e2e-dynamic-mock`).spread((response, body) => {
				expect(response.statusCode).toBe(200);
				expect(body).toBe('Counter: 2');
			});
		});
	});
});

describe('clean', () => {
	beforeAll(() => mockServer.start());
	afterAll(mockServer.stop);

	it('should return a mock when it has been added', done => {
		// Add mock
		backendService.addMock({
			uri: '/test',
			method: 'get',
			response: {
				body: 'hello world'
			}
		})

		// Mock should be returned
		.then(() => {
			return request(`${MOCKED_HOST_URI}/test`).spread((response, body) => {
				expect(response.statusCode).toBe(200);
				expect(body).toBe('hello world');
			});
		})
		.then(done, done.fail);
	});

	it('should not return a mock after it has been cleared', done => {
		mockClient.clearAll()

		// Requests should be cleared
		.then(() => backendService.getRequests())
		.then(res => {
			expect(res).toEqual([]);
		})

		// Mock should not be returned
		.then(() => {
			request(`${MOCKED_HOST_URI}/test`)
				.then(done.fail)
				.catch(() => {});
		})
		.then(done, done.fail);
	});
});
