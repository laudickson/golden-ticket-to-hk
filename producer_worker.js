'use strict';

(function() {

	var Promise = require('bluebird');
	var Fivebeans = Promise.promisifyAll(require('fivebeans'));

	// Constructor
	function ProducerWorker(config) {
		this.config = config
	}

	// Seed the tube first
	ProducerWorker.prototype.put = function(seed) {
		let client = new Fivebeans.client(this.config.host, this.config.port);

		let current_tube = this.config.tube_name;

		return new Promise(function (resolve, reject) {
			client.onAsync('connect').then(function () {
				co(function* () {
					let current_tube = yield client.useAsync(tube_name);
					// Put job into queue
					let job = yield client.putAsync(0, delay, 60, JSON.stringify([current_tube, seed]));
					client.end();
					return job;
				}).then(function (job) {
					resolve(jobid);
				}, function (err) {
					reject(err);
				});
			});

			client.onAsync('error').then(function (err) {
				reject(err);
			});

			client.connect();
		});
	};

	module.exports = ProducerWorker;
})();
