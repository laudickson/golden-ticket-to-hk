'use strict';

(function() {

	let Promise = require('bluebird');
  let $ = require('cheerio');
	let Fivebeans = Promise.promisifyAll(require('fivebeans'));
	let ExchangeHelper = require('../currency_converter/exchange_helper');

	// Initialize worker
	function WorkerConsumer(env, mongo_url) {
		this.env = env;
    this.mongo_url = mongo_url;
	}

  // Worker doing the actual job
  WorkerConsumer.prototype.start = function () {
		let options = {
			id: 'Just your average Consumer Worker'
			host: this.env.host,
			port: this.env.port,
			handlers: {
				current_rate: new ExchangeHelper(this)
			},
			ignoreDefault: true
		};

    // Fivebeans worker
		let worker = new Fivebeans.worker(options);

		worker.start([this.env.tube_name]);

    console.log(`WorkingConsumer with _id: ${this.id}. The Consumer Worker has begun its job.`);
	};

	module.exports = WorkerConsumer;
})();
