let env = require('./env');
let ConsumerWorker = require('./worker/consumer');
let consumer_worker = new ConsumerWorker(env);

consumer_worker.start();
