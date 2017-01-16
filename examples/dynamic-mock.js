let counter = 0;

module.exports = function (addRoute) {
	addRoute({
		port: 2020,
		method: 'GET',
		uri: '/dynamic-mock-example',
		handler: function (req, res) {
			counter++;
			res.send(`Counter: ${counter}`);
		}
	});
};
