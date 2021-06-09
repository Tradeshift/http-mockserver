const Q = require('q');
const request = Q.denodeify(require('request'));
const mockServer = require('../src/server/index.js');

describe('examples', () => {
	describe('static-mocks.json', () => {
		beforeAll(() => {
			const mocks = require('../examples/static-mock');
			mockServer.addMocks(...mocks);
		});
		afterAll(mockServer.stop);

		it('should render simple static mock', () => {
			return request('http://localhost:2021/simple-static-mock-example', {json: true}).spread((response, body) => {
				expect(response.statusCode).toBe(200);
				expect(response.headers['content-type']).toMatch(/application\/json/);
				expect(body).toEqual({someKey: 'some value'});
			});
		});

		it('should replace placeholders with values', () => {
			return request('http://localhost:2021/static-mock-with-params-example/sqren', {json: true}).spread((response, body) => {
				expect(response.statusCode).toBe(200);
				expect(response.headers['content-type']).toMatch(/text\/html/);
				expect(body).toEqual('My name is sqren');
			});
		});

		it('should return json response with placeholders replaced', () => {
			return request('http://localhost:2021/static-mock-with-params-json-example/sqren', {json: true}).spread((response, body) => {
				expect(response.statusCode).toBe(200);
				expect(response.headers['content-type']).toMatch(/application\/json/);
				expect(body).toEqual({
					name: 'sqren'
				});
			});
		});
	});

	describe('dynamic-mock.js', () => {
		beforeEach(() => {
			const mocks = require('../examples/dynamic-mock');
			mockServer.addMocks(...mocks);
		});
		afterEach(mockServer.stop);

		it('should increment counter for every GET request', () => {
			return request('http://localhost:2020/dynamic-mock-example').spread((response, body) => {
				expect(response.statusCode).toBe(200);
				expect(body).toEqual('Counter: 1');
			})
			.then(() => {
				return request('http://localhost:2020/dynamic-mock-example').spread((response, body) => {
					expect(response.statusCode).toBe(200);
					expect(body).toEqual('Counter: 2');
				});
			});
		});
	});
});
