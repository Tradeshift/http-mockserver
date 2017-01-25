const Q = require('q');
const request = Q.denodeify(require('request'));
const mockServer = require('../src/server/index.js');

describe('examples', () => {
	beforeAll(() => mockServer.addMocks('./examples').start());
	afterAll(mockServer.stop);

	it('static mock', done => {
		return request('http://localhost:2021/static-mock-example', {json: true}).spread((response, body) => {
			expect(response.statusCode).toBe(200);
			expect(response.headers['content-type']).toMatch(/application\/json/);
			expect(body).toEqual({someKey: 'some value'});
		})
		.then(done, done.fail);
	});

	it('should return text response with placeholders replaced', done => {
		return request('http://localhost:2021/static-mock-with-params-example/sqren', {json: true}).spread((response, body) => {
			expect(response.statusCode).toBe(200);
			expect(response.headers['content-type']).toMatch(/text\/html/);
			expect(body).toEqual('My name is sqren');
		})
		.then(done, done.fail);
	});

	it('should return json response with placeholders replaced', done => {
		return request('http://localhost:2021/static-mock-with-params-json-example/sqren', {json: true}).spread((response, body) => {
			expect(response.statusCode).toBe(200);
			expect(response.headers['content-type']).toMatch(/application\/json/);
			expect(body).toEqual({
				name: 'sqren'
			});
		})
		.then(done, done.fail);
	});

	it('dynamic mock', done => {
		return request('http://localhost:2020/dynamic-mock-example').spread((response, body) => {
			expect(response.statusCode).toBe(200);
			expect(body).toEqual('Counter: 1');
		})
		.then(() => {
			return request('http://localhost:2020/dynamic-mock-example').spread((response, body) => {
				expect(response.statusCode).toBe(200);
				expect(body).toEqual('Counter: 2');
			});
		})
		.then(done, done.fail);
	});
});
