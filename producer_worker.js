'use strict';

(function() {

	var Promise = require('bluebird');
	var Fivebeans = Promise.promisifyAll(require('fivebeans'));

	// Constructor
	function ProducerWorker(config) {
		this.config = config
	}

	// Function: Put a Seed on the tube
	ProducerWorker.prototype.put = function(seed) {
		let client = new Fivebeans.client(this.config.host, this.config.port);
		let tube_name = this.config.tube_name;

		client.on('connect', function() {

			client
				.useAsync(tube_name)
				.then(function(current_tube) {
					console.log(`WorkerProducer: Use tube '${current_tube}'`);
					return client.putAsync(0, delay, 60, JSON.stringify([tube_name, seed]))
				})
				.then(function(jobid) {
					console.log(`Job Queued: ${seed.type} in '${tube_name}': ${jobid}`);
					client.end();
				})
				.catch(function(err) {
					console.log(err);
				})

		}).on('error', function(err) {

			// connection failure
			console.log(err);

		}).on('close', function() {

			// underlying connection has closed
			console.log('The Producer Worker is finished with his job.');

		}).connect();
	};

	module.exports = WorkerProducer;
})();
