'use strict';

(function() {

	let Promise = require('bluebird');
	let Fivebeans = Promise.promisifyAll(require('fivebeans'));
	let Exchanger = require('../exchange_rate/exchanger');

	// Constructor
	function WorkerConsumer(env, mongo_url) {
		this.env = env;
    this.mongo_url = mongo_url;
	}

  // Worker doing the actual job
  WorkerConsumer.prototype.start = function () {
		let options = {
			id: 'A Consumer Worker'
			host: this.env.host,
			port: this.env.port,
			handlers: {
				current_rate: new Exchanger(this)
			},
			ignoreDefault: true
		};

    // Fivebeans worker
		let worker = new Fivebeans.worker(options);
		worker.start([this.env.tube_name]);
		console.log('The Consumer Worker has begun its job.');
	};

	module.exports = WorkerConsumer;
})();
