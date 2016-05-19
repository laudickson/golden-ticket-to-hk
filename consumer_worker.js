(function() {
	'use strict';

	// Declare imports
	var Promise = require('bluebird');
	var Fivebeans = Promise.promisifyAll(require('fivebeans'));
	var HandlerCurrency = require('./handler_currency');

	// Constructor
	function ConsumerWorker(config) {
		this.host = config.host;
		this.port = config.port;
		this.tube_name = config.tube_name;
	}

	ConsumerWorker.prototype.start = function() {
		var options = {
			id: 'SOME_RANDOM_ID',
			host: this.host,
			port: this.port,
			handlers: {
				currency: new HandlerCurrency()
			},
			ignoreDefault: true
		}

		var worker = new Fivebeans.worker(options);
		worker.start([this.tube_name]);
	};

	module.exports = ConsumerWorker;
})();
