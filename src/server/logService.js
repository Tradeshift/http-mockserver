let isDebugEnabled = process.env.NODE_ENV !== 'test';

module.exports = {
	enableDebug: function () {
		isDebugEnabled = true;
	},

	error: (...args) => {
		console.error(...args);
	},

	info: (...args) => {
		if (isDebugEnabled) {
			console.info(...args);
		}
	}
};
