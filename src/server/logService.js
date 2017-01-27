function isTestEnv () {
	return process.env.NODE_ENV === 'test';
}

module.exports = {
	error: (...args) => {
		console.error(...args);
	},
	info: (...args) => {
		if (isTestEnv()) return;
		console.info(...args);
	}
};
