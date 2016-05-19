var config = require('./config');
var ConsumerWorker = require('./worker/consumer');

var consumer_worker = new ConsumerWorker(config);

consumer_worker.start();
