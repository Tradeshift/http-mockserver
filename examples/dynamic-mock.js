let counter = 0;

module.exports = function (addMock) {
	// Simple mock with counter
	addMock({
		port: 2020,
		method: 'GET',
		uri: '/dynamic-mock-example',
		handler: function (req, res) {
			counter++;
			res.send(`Counter: ${counter}`);
		}
	});

	// Parameterized mock
	addMock({
		port: 2020,
		method: 'GET',
		uri: '/dynamic-parameterized-example/:name',
		handler: function (req, res) {
			res.send({
				Name: `${req.params.name}`
			});
		}
	});
};
