'use strict';

(function() {

	var Promise = require('bluebird');
	var Fivebeans = Promise.promisifyAll(require('fivebeans'));
  let co = require('co');

	// initialize the worker
	function ProducerWorker(env) {
		this.env = env
	}

	// Seed the tube first
	ProducerWorker.prototype.put = function(seed, delay) {
		let client = new Fivebeans.client(this.env.host, this.env.port);
		let tube_name = this.env.tube_name;

		return new Promise(function (resolve, reject) {
			client.onAsync('connect').then(function () {
				co(function* () {
					let current_tube = yield client.useAsync(tube_name);
					// Put job into queue
					let job = yield client.putAsync(0, delay, 60, JSON.stringify([current_tube, seed]));
					client.end();
					return job;
				}).then(function (job) {
					resolve(job);
				}, function (error) {
					reject(error);
				});
			});

			client.onAsync('error').then(function (error) {
				reject(error);
			});

			client.connect();
		});
	};

	module.exports = ProducerWorker;
})();
