let env = require('./env');
let ConsumerWorker = require('./worker/consumer');
let mongo_url = "mongodb://tsdlau:password123@ds025742.mlab.com:25742/golden-ticket"
let consumer_worker = new ConsumerWorker(env, mongo_url);

consumer_worker.start();
