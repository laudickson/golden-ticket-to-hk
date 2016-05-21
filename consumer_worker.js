'use strict';

(function() {

	let Promise = require('bluebird');
	let Fivebeans = Promise.promisifyAll(require('fivebeans'));
	let Exchanger = require('./exchanger');

	// Constructor
	function WorkerConsumer(env) {
		this.env = env;
	}

  // Worker doing the actual job
	WorkerConsumer.prototype.start = function() {
		let options = {
			host: this.env.host,
			port: this.env.port,
			handlers: {
				rate: new Exchanger(this)
			},
			ignoreDefault: true
		}

    // Fivebeans worker
		let worker = new Fivebeans.worker(options);
		worker.start([this.config.tube_name]);
		console.log('The Consumer Worker has begun its job.');
	};

	module.exports = WorkerConsumer;
})();
