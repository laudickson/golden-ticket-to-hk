let config = require('./config');
let ConsumerWorker = require('./consumer_worker');
let consumer_worker = new ConsumerWorker(config);

consumer_worker.start();
