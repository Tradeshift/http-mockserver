let counter = 0;

module.exports = function (addRoute) {
	addRoute(2020, {
		uri: '/sqren',
		method: 'GET',
		handler: function (req, res) {
			counter++;
			res.send(`Counter: ${counter}`);
		}
	});
};
