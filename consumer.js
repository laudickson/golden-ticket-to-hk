'use strict';

let mongo_uri = "mongodb://tsdlau:password123@ds025742.mlab.com:25742/golden-ticket";
let config = require('./config/env');
let WorkerConsumer = require('./worker/consumer');

// Start a new WorkerConsumer
let worker_consumer = new WorkerConsumer(config, mongo_uri, true);
worker_consumer.start();
