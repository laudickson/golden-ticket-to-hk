'use strict';

(function () {
	let Promise = require('bluebird');
	let co = require('co');
	let $ = require('cheerio');
	let mongoose = Promise.promisifyAll(require('mongoose'));
	let request = Promise.promisify(require('request'));
	let ExchangeRate = Promise.promisifyAll(require('./exchange_rate'));
	let WorkerProducer = require('./../worker/producer');
	let Seed = require('./../config/seed');

  // Parameters for the job
  let success_max = 10;
	let fail_max = 3;
	let success_timer = 60;
	let fail_timer = 3;

	function CurrencyExchanger(worker) {
		this.type = 'exchange_rate';
		this.worker = worker;
	}

  // This is how the job will be processed and handled
	CurrencyExchanger.prototype.work = function (payload, callback) {
		let seed = new Seed(payload.from, payload.to, payload.success, payload.fail);
		let worker = this.worker;

    // Set up the mongodb connection
		co(function* () {
			yield (co(function* () {
  			if (mongoose.connection.readyState) {
  				yield Promise.resolve(mongoose.connection.readyState);
  			} else {
  				mongoose.connect(worker.mongo_uri);
  				yield mongoose.connection.onceAsync('open').timeout(10 * 1000);
  			}
  		}));

      // Obtain the exchange rate through GET request
			let exchange_rate = yield (new Promise(function (resolve, reject) {
        let url = `http://www.xe.com/currencyconverter/convert/?From=${payload.from}&To=${payload.to}`;

        request(url).spread(function (response, body) {
          let exchange_rate_line = $(body).find('.uccResUnit').find('.rightCol').text();

          // Trimming the string, formatting to two decimal places.
          let string = new RegExp(`1\\s${payload.to}\\s=\\s(.*)\\s${payload.from}`);
          let search_result = exchange_rate_line.match(string);

          if (search_result === null) {
            reject(`Cannot get exchange rate, invalid 'from' or 'to'`);
          } else {
            let exchange_rate = Number(exchange_rate_line.match(string)[1]).toFixed(2).toString();
            resolve(exchange_rate);
          }
        }).catch(function (error) {
          reject(error);
        });
      }));

      // Save the data to mongodb
			let data = yield (new Promise(function (resolve, reject) {
  			new ExchangeRate({
  				from: payload.from,
  				to: payload.to,
  				created_at: new Date(),
  				rate: exchange_rate
  			}).saveAsync().then(function (data) {
  				resolve(data);
  			}).catch(function (error) {
  				reject(error);
  			});
  		}));

      console.log('====================');
      console.log(`Input: ${JSON.stringify(payload)}`);
      console.log(`Obtaining rate for payload data...`);

			if (++seed.payload.success < success_max) {
				cycle(worker.config, seed, success_timer).then(function (job_id) {

          // Successful iteration
          console.log(`...Success!`);
          console.log(`From: ${payload.from}`);
          console.log(`To: ${payload.to}`);
          console.log(`Current Rate: ${exchange_rate}`)
          console.log(`Saved to mongo with id: '${data[0]._id}'`);
        	console.log(`Successful iterations: ${seed.payload.success}.`);
          console.log(`Failed iterations: ${seed.payload.fail}.`);
          console.log(`Cycling next iteration with job_id: '${job_id}'`);
				}).catch(function (error) {

          // Error with the actual iteration itself. Cycle the next iteration
          console.log(`...No good!`);
          console.log(`There was an error in the iteration: ${error}`);
  				console.log(`Successful iterations: ${seed.payload.success}.`);
          console.log(`Failed iterations: ${seed.payload.fail}.`);
          console.log(`Cycling next iteration with job_id: '${job_id}'`);
				});
			} else {

        // Stop the job after 10 successful iterations
        console.log(`Complete Success!`);
        console.log(`Successful iterations: ${seed.payload.success}.`);
        console.log(`Failed iterations: ${seed.payload.fail}.`);
        console.log('====================');
        console.log(`Done with the work and going home, bye!`);
			}

			callback('success');
		}).catch(function (exchange_rate_error) {
			if (++seed.payload.fail < fail_max) {
				cycle(worker.config, seed, fail_timer).then(function (job_id) {

          // Error with the obtaining of exchange rate. Cycle the next iteration
          console.log(`...No good!`);
          console.log(`There was an error obtaining the rate: ${exchange_rate_error}`)
          console.log(`Successful iterations: ${seed.payload.success}.`);
          console.log(`Failed iterations: ${seed.payload.fail}.`);
          console.log(`Cycling next iteration with: '${job_id}'`);
				}).catch(function (error) {

          // Error with the actual iteration itself. Cycle the next iteration
          console.log(`...No good!`);
          console.log(`There was an error in the iteration: ${error}`);
          console.log(`Successful iterations: ${seed.payload.success}.`);
          console.log(`Failed iterations: ${seed.payload.fail}.`);
          console.log(`Cycling next iteration with: '${job_id}'`);
				});
			} else {

        // Stop the job after 3 failed iterations
        console.log(`...No good!`);
        console.log(`There was an error obtaining the rate: ${exchange_rate_error}`);
        console.log(`Successful iterations: ${seed.payload.success}.`);
        console.log(`Failed iterations: ${seed.payload.fail}.`);
        console.log(`Too many failures :( Going to quit the job, now. Bye!`);
			}

			callback('success');
		});
	};

  // Cycle the next job iteration
	function cycle(config, seed, delay) {
		let worker_producer = new WorkerProducer(config);
		return worker_producer.put(seed, delay);
	}

	module.exports = CurrencyExchanger;
})();
