(function () {
	// Declare imports
	let Promise = require('bluebird');
	let mongoose = require('mongoose');
	let request = require('request');
	let $ = require('cheerio');
	let WorkerProducer = require('./producer_worker');
	let Seed = require('./seed');

  // Seeder
  function seed(from, to, success, failure){
    this.type = 'rate'
    this.payload = {
      from: from,
      to: to,
      success: 0,
      failure: 0
    }
  }

	// Constructor
	function ExchangeRate(user) {
		this.type = 'rate';
		this.user = user;
	}

  // Obtain rate 10 times and log each one as a success or failure. If 10 successes, end job.
	ExchangeRate.prototype.work = function (payload, callback) {
		let seed = new Seed(payload.from, payload.to, payload.success, payload.failure);
		let _this = this;
		getRate(payload.from, payload.to)
			.then(function (rate) {
  			console.log(rate);
				saveToMongo(rate);
				seed.payload.success++;

				if (seed.payload.success < 10) {
					console.log('Successfully obtained rate');
					redo(_this.user.config, seed, 3);
				}
				callback('success');
			})
      // If it fails 3 times, give up the job.
			.catch(function (err) {
				seed.payload.failure++;
				if (seed.payload.failure < 3) {
					console.log('Failed to get the rate.');
					redo(_this.owner.config, seed, 3);
				}
				callback('success');
			});
	};

	function redo(config, seed, delay) {
		let producer_worker = new ProducerWorker(this.user.config);
		producer_worker.put(seed, delay);
	}

  function getExchangeRate(from, to, cb){
      var url = 'http://www.xe.com/currencyconverter/convert/?Amount=1&From='+from+'&To='+to;
      co(function *(){
          var result = yield request(url);
          var $ = cheerio.load(result[1]);
          var extracted_data = $('.rightCol')[0].children[0].data;

          //cannot find the rate in the webpage, throw an error
          if($('.rightCol').length <= 0){
              cb(new Error("Cannot get the rate"));
          }

          //change the rate to string format
          extracted_data = parseFloat(extracted_data).toFixed(2).toString();
          cb(null, extracted_data);
      }).catch(function(err){
          cb(err);
      });
  };

	function saveToMongo(rate) {

	}

	module.exports = ExchangeRate;
})();
