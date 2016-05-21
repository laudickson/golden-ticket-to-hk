let env = require('./env');
let ConsumerWorker = require('./consumer_worker');
let consumer_worker = new ConsumerWorker(env);

consumer_worker.start();
