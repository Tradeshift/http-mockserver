let counter = 0;

module.exports = function (addRoute) {
	addRoute({
		port: 2020,
		method: 'GET',
		uri: '/sqren',
		handler: function (req, res) {
			counter++;
			res.send(`Counter: ${counter}`);
		}
	});
};
