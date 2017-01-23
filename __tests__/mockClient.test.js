const Q = require('q');
const request = Q.denodeify(require('request'));
const MOCKSERVER_URI = 'localhost:3000';
const MockClient = require('../src/client/Client')(MOCKSERVER_URI);
const MOCKED_HOST_URI = 'http://localhost:4000';
const mockClient = new MockClient(4000);

describe('when adding mocks on the same uri', () => {
	it('should return first mock', done => {
		mockClient.addMock({
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
		mockClient.addMock({
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

describe('clean', () => {
	it('should return a mock when it has been added', done => {
		// Add mock
		mockClient.addMock({
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
		MockClient.clearAll()

		// Requests should be cleared
		.then(() => mockClient.getRequests())
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

afterEach(() => MockClient.clearAll());

