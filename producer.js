'use strict';

let env = require('./config/env');
let Seed = require('./config/seed');
let WorkerProducer = require('./worker/producer');

let worker_producer = new WorkerProducer(config);
let seed = new Seed('HKD', 'USD', 0, 0);

// Put the seed on the tube
worker_producer.put(seed, 0).then(function (jobid) {
	// Put seed success
	console.log(`WorkerProducer: Put a seed on tube tube_name: '${config.tube_name}', jobid: '${jobid}'`);
	console.log(`WorkerProducer: Seed: ${JSON.stringify(seed)}'`);
}).catch(function (err) {
	// Put seed failure
	console.log(`WorkerProducer: Error on putting seed - Error: ${err}`);
});
