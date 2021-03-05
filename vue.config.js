module.exports = {
	productionSourceMap: false,
	configureWebpack(config) {
		config.node = false;
	}
};
