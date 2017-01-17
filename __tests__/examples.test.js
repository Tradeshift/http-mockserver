const Q = require('q');
const request = Q.denodeify(require('request'));

describe('examples', () => {
	it('static mock', done => {
		return request('http://localhost:2021/static-mock-example', {json: true}).spread((response, body) => {
			expect(response.statusCode).toBe(200);
			expect(body).toEqual({someKey: 'some value'});
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
