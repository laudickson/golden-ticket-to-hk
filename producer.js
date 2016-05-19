var Seed = require('./seed');
var ProducerWorker = require('./producer_worker');

var producer_worker = new ProducerWorker({
  host: 'challenge.aftership.net',
  port: 11300,
  tube_name: 'tsdlau'
});

var seed = new Seed('USD','HKD');

producer_worker.put(seed);
