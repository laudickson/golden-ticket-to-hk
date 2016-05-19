(function() {
	'use strict';

	// Declare imports
	var Seed = require('./seed');
	var Promise = require('bluebird');
	var Fivebeans = Promise.promisifyAll(require('fivebeans'));

	// Constructor
	function ProducerWorker(config) {
		this.config = config
	}

	// Function: Put a Seed on the tube
	ProducerWorker.prototype.put = function(seed) {

		var client = new Fivebeans.client(this.config.host, this.config.port);
		var tube_name = this.config.tube_name;

		client.on('connect', function() {

			client
				.useAsync(tube_name)
				.then(function(tube_name) {

					return client.putAsync(0, 0, 60, JSON.stringify([tube_name, seed]))
				})
				.then(function(jobid) {
					client.end();
				})
				.catch(function(err) {
				})

		}).on('error', function(err) {

			// connection failure
			console.log('The Producer Worker has encountered an error: ' + err);

		}).on('close', function() {

			console.log('The Producer Worker is done with the job. Now Closing.');

		}).connect();
	};

	module.exports = WorkerProducer;
})();
