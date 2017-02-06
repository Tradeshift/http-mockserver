let counter = 0;

module.exports = [{
	port: 2020,
	method: 'GET',
	uri: '/dynamic-mock-example',
	handler: function (req, res) {
		counter++;
		res.send(`Counter: ${counter}`);
	}
}, {
	port: 2020,
	method: 'GET',
	uri: '/dynamic-parameterized-example/:name',
	handler: function (req, res) {
		res.send({
			Name: `${req.params.name}`
		});
	}
}];
