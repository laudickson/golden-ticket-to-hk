
function seed(from, to, success, failure){
  this.type = 'rate'
  this.payload = {
    from: from,
    to: to,
    success: 0,
    failure: 0
  }
}

let ProducerWorker = require('./producer_worker');

let producer_worker = new ProducerWorker({
  host: 'challenge.aftership.net',
  port: 11300,
  tube_name: 'tsdlau'
});

var seed = new Seed('USD', 'HKD', 0, 0);

producer_worker.put(seed,0);
