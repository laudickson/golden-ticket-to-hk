'use strict';

(function () {
	let Promise = require('bluebird');
	let Fivebeans = Promise.promisifyAll(require('fivebeans'));
	let CurrencyExchanger = require('./../currency_converter/currency_exchanger');

  // Initializing a worker consumer
	function WorkerConsumer(config, mongo_uri) {
		this.id = 'Your average worker doing its consumption',
		this.config = config;
		this.mongo_uri = mongo_uri;
	}

  // Protocol for the job
	WorkerConsumer.prototype.start = function () {
		let options = {
			id: this.id,
			host: this.config.host,
			port: this.config.port,
			handlers: {
				exchange_rate: new CurrencyExchanger(this)
			},
			ignoreDefault: true
		};

		let worker = new Fivebeans.worker(options);
		worker.start([this.config.tube_name]);

		console.log(`A worker with _id: '${this.id}' has begun his job on the tube: '${this.config.tube_name}'`);
	};

	module.exports = WorkerConsumer;
})();
