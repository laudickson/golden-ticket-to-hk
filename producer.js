'use strict';

let config = require('./config/env');
let Seed = require('./config/seed');
let WorkerProducer = require('./worker/producer');

// Creating a new producer and a seed
let worker_producer = new WorkerProducer(config);

// Change 'HKD' or 'USD' to other countries with valid country abbreviations
let seed = new Seed('HKD', 'USD', 0, 0);

// Seed the beanstalk!
worker_producer.put(seed, 0).then(function (jobid) {

  // Successful seeding
	console.log(`The beanstalkd with tube name: '${config.tube_name} has been seeded. It's ready for consumption!`);
	console.log(`Seed data: ${JSON.stringify(seed)}'`);
}).catch(function (error) {

  // Failed seeding
	console.log(`There was an error in seeding the beanstalk!`);
  console.log(`Error: ${error}`);
});
