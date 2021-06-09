const Q = require('q');
const request = Q.denodeify(require('request'));
const {mockClient, mockServer} = require('../src/index');
const MOCKED_HOST_URI = 'http://localhost:4000';
const backendService = mockClient.create(4000);

describe('when adding mocks on the same uri', () => {
	beforeAll(() => mockServer.start());
	afterAll(mockServer.stop);

	it('should return first mock', async () => {
		await expect(backendService.addMock({
			uri: '/duplicate-mock',
			method: 'GET',
			response: {
				body: 'First response'
			}
		})).resolves.toMatchObject({statusCode: 200});

		const {response, body} = await request(`${MOCKED_HOST_URI}/duplicate-mock`)
			.spread((response, body) => ({response, body}));

		expect(response.statusCode).toBe(200);
		expect(body).toBe('First response');
	});

	it('should return second mock', async () => {
		await expect(backendService.addMock({
			uri: '/duplicate-mock',
			method: 'GET',
			response: {
				body: 'Second response'
			}
		})).resolves.toMatchObject({statusCode: 200});

		const {response, body} = await request(`${MOCKED_HOST_URI}/duplicate-mock`)
			.spread((response, body) => ({response, body}));
		expect(response.statusCode).toBe(200);
		expect(body).toBe('Second response');
	});
});

describe('when adding dynamic mock', () => {
	beforeAll(() => mockServer.start());
	afterAll(mockServer.stop);

	it('should dynamically update the response', () => {
		let counter = 0;
		mockServer.addMock({
			port: 2031,
			method: 'GET',
			uri: '/e2e-dynamic-mock',
			handler: function (req, res) {
				counter++;
				res.send(`Counter: ${counter}`);
			}
		});

		return request(`http://localhost:2031/e2e-dynamic-mock`).spread((response, body) => {
			expect(response.statusCode).toBe(200);
			expect(body).toBe('Counter: 1');
		})
		.then(() => {
			return request(`http://localhost:2031/e2e-dynamic-mock`).spread((response, body) => {
				expect(response.statusCode).toBe(200);
				expect(body).toBe('Counter: 2');
			});
		});
	});
});

describe('clean', () => {
	beforeAll(() => mockServer.start());
	afterAll(mockServer.stop);

	it('should return a mock when it has been added', async () => {
		// Add mock
		await expect(backendService.addMock({
			uri: '/test',
			method: 'get',
			response: {
				body: 'hello world'
			}
		})).resolves.toMatchObject({ statusCode: 200 });

		// Mock should be returned
		const {response, body} = await request(`${MOCKED_HOST_URI}/test`)
			.spread((response, body) => ({response, body}));
		expect(response.statusCode).toBe(200);
		expect(body).toBe('hello world');
	});

	it('should not return a mock after it has been cleared', async () => {
		await expect(mockClient.clearAll()).resolves.toBeTruthy();
		// Requests should be cleared
		await expect(backendService.getRequests()).resolves.toStrictEqual([]);
		// Mock should not be returned
		await expect(request(`${MOCKED_HOST_URI}/test`)).rejects.toBeTruthy();
	});
});
