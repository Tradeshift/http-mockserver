const Q = require('q');
const request = Q.denodeify(require('request'));
const MockClient = require('../src/client/Client');
const MOCKSERVER_URI = 'localhost:3000';
const MOCKED_HOST_URI = 'http://localhost:4000';
const mockClient = new MockClient(4000, MOCKSERVER_URI);

describe('when adding routes on the same uri', () => {
	it('should return first response when route is added once', done => {
		mockClient.addRoute({
			uri: '/duplicate-route',
			method: 'GET',
			response: {
				body: 'First response'
			}
		})
		.then(() => {
			return request(`${MOCKED_HOST_URI}/duplicate-route`).spread((response, body) => {
				expect(response.statusCode).toBe(200);
				expect(body).toBe('First response');
			});
		})
		.then(done, done.fail);
	});

	it('should return second response when route it overwritten', done => {
		mockClient.addRoute({
			uri: '/duplicate-route',
			method: 'GET',
			response: {
				body: 'Second response'
			}
		})
		.then(() => {
			return request(`${MOCKED_HOST_URI}/duplicate-route`).spread((response, body) => {
				expect(response.statusCode).toBe(200);
				expect(body).toBe('Second response');
			});
		})
		.then(done, done.fail);
	});
});

describe('clean', () => {
	it('should be possible to add a route and call it', done => {
		// Add route
		mockClient.addRoute({
			uri: '/test',
			method: 'get',
			response: {
				body: 'hello world'
			}
		})

		// Route can be called
		.then(() => {
			return request(`${MOCKED_HOST_URI}/test`).spread((response, body) => {
				expect(response.statusCode).toBe(200);
				expect(body).toBe('hello world');
			});
		})
		.then(done, done.fail);
	});

	it('should not be possible to call the route after it has been cleared', done => {
		mockClient.clear()

		// requests are cleared
		.then(() => mockClient.getRequests())
		.then(res => {
			expect(res).toEqual([]);
		})

		// Route can no longer be called
		.then(() => {
			request(`${MOCKED_HOST_URI}/test`)
				.then(done.fail)
				.catch(() => {});
		})
		.then(done, done.fail);
	});
});

afterEach(() => mockClient.clear());
