const Listener = require('../src/server/Listener');

describe('listener', () => {
	let listener;
	beforeEach(() => {
		listener = new Listener(3001);
	});

	afterEach(() => {
		listener.destroy();
	});

	it('should match paths without tokens', () => {
		const tokenlessPath = '/path/without/tokens';
		listener.add({
			method: 'GET',
			response: { body: 'a' },
			uri: tokenlessPath
		});
		const result = listener.get(tokenlessPath, 'GET');
		expect(result.options.uri).toBe(tokenlessPath);
		expect(result.options.response.body).toBe('a');
	});

	it('should match paths with a single token', () => {
		const tokenPath = '/path/:with/tokens';
		listener.add({
			method: 'GET',
			response: { body: 'b' },
			uri: tokenPath
		});
		const result = listener.get('/path/alpha/tokens', 'GET');
		expect(result.options.uri).toBe(tokenPath);
		expect(result.options.response.body).toBe('b');
	});

	it('should match paths with multiple tokens', () => {
		const tokenPath = '/path/:with/tokens/:and/so/:much/other/:stuff';
		listener.add({
			method: 'GET',
			response: { body: 'c' },
			uri: tokenPath
		});
		const result = listener.get('/path/first/tokens/second/so/third/other/fourth', 'GET');
		expect(result.options.uri).toBe(tokenPath);
		expect(result.options.response.body).toBe('c');
	});

	it('should not do partial token matching', () => {
		const tokenPath = '/path/:with/tokens/:and/:stuff';
		listener.add({
			method: 'GET',
			response: { body: 'd' },
			uri: tokenPath
		});
		const result = listener.get('/path/first/tokens/second', 'GET');
		expect(result).toBeUndefined();
	});

	it('should do partial token matching', () => {
		const tokenPath = '/path/:with/tokens/:and/:stuff?';
		listener.add({
			method: 'GET',
			response: { body: 'd' },
			uri: tokenPath
		});
		const result = listener.get('/path/first/tokens/second', 'GET');
		expect(result.options.uri).toBe(tokenPath);
		expect(result.options.response.body).toBe('d');
	});

	it('should match the uri method on paths with tokens', () => {
		const tokenPath = '/path/:with/tokens/:and/:stuff';
		listener.add({
			method: 'DELETE',
			response: {},
			uri: tokenPath
		});
		listener.add({
			method: 'GET',
			response: { body: 'e' },
			uri: tokenPath
		});
		listener.add({
			method: 'PUT',
			response: {},
			uri: tokenPath
		});
		const result = listener.get('/path/first/tokens/second/third', 'GET');
		expect(result.options.response.body).toBe('e');
	});
});
