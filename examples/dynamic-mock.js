let counter = 0;

module.exports = function (addMock) {
	addMock({
		port: 2020,
		method: 'GET',
		uri: '/dynamic-mock-example',
		handler: function (req, res) {
			counter++;
			res.send(`Counter: ${counter}`);
		}
	});
};
