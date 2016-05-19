(function() {

	var Seed = require('./seed');
	var Promise = require('bluebird');
	var Fivebeans = Promise.promisifyAll(require('fivebeans'));

	// Constructor
	function WorkerProducer(config) {
		this.config = config
	}

	// Function: Put a Seed on the tube
	WorkerProducer.prototype.put = function(seed) {

		console.log('WorkerProducer: Put seed start');
		console.log(seed);

		var client = new Fivebeans.client(this.config.host, this.config.port);
		var tube_name = this.config.tube_name;

		client.on('connect', function() {

			client
				.useAsync(tube_name)
				.then(function(tube_name) {
					console.log('WorkerProducer: Use tube "' + tube_name + '"');
					return client.putAsync(0, 0, 60, JSON.stringify([tube_name, seed]))
				})
				.then(function(jobid) {
					console.log('WorkerProducer: Queued a ' + seed.type + ' job in "' + tube_name + '": ' + jobid);
					client.end();
				})
				.catch(function(err) {
					console.log('WorkerProducer: Error ' + err);
				})

		}).on('error', function(err) {

			// connection failure
			console.log('WorkerProducer: Error ' + err);

		}).on('close', function() {

			// underlying connection has closed
			console.log('WorkerProducer: Closed');

		}).connect();
	};

	module.exports = WorkerProducer;
})();
