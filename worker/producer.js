'use strict';

(function () {
	let Promise = require('bluebird');
	let Fivebeans = Promise.promisifyAll(require('fivebeans'));
	let co = require('co');

  // Initializing the worker
	function WorkerProducer(config) {
		this.config = config;
	}

	// Protocol for seeding the tube (consumer shouldn't seed!)
	WorkerProducer.prototype.put = function (seed, delay) {
		let client = new Fivebeans.client(this.config.host, this.config.port);
		let tube_name = this.config.tube_name;

		return new Promise(function (resolve, reject) {
			client.onAsync('connect').then(function () {
				co(function* () {
					let current_tube = yield client.useAsync(tube_name);

          //seed the beanstalk and use the job_id as the reference
					let job_id = yield client.putAsync(0, delay, 60, JSON.stringify([current_tube, seed]));
					client.end();
					return job_id;
				}).then(function (job_id) {
					resolve(job_id);
				}, function (error) {
					reject(error);
				});
			});
			client.onAsync('error').then(function (error) {
				reject(error);
			});

      // Once all done, connect the beanstalk!
			client.connect();
		});
	};

	module.exports = WorkerProducer;
})();
