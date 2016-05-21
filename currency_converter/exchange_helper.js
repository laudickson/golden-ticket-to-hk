'use strict';

(function () {
	let Promise = require('bluebird');
	let co = require('co');
	let $ = require('cheerio');
	let request = Promise.promisify(require('request'));
	let CurrentRate = Promise.promisifyAll(require('./current_rate'));
	let WorkerProducer = require('./producer_worker');
	let Seed = require('../config/seed');
  let mongoHelper = require('../assets/mongo_helper');
  let RateHelper = require('./rate_helper');
  let saveToMongo = require('../assets/mongo_save')
  let Printer = require('../assets/printer')

	const SUCCESS_MAX = 10;
	const FAIL_MAX = 3;

	const SUCCESS_TIMER = 60;
	const FAILURE_TIMER = 3;

  // Initialize the worker
	function ExchangeHelper(consumer_worker) {
		this.type = 'current_rate';
		this.worker = consumer_worker;
	}

	ExchangeHelper.prototype.work = function (payload, callback) {
		let seed = new Seed(payload.from, payload.to, payload.success, payload.success);
		let worker = this.worker;

		co(function* () {
			yield mongoHelper(worker.mongo_url);
			let rate = yield RateHelper(payload.from, payload.to);
			let data = yield saveToMongo(payload.from, payload.to, rate, new Date());

			// Keep cycling until 10 successive iterations
			if (++seed.payload.success < SUCCESS_MAX) {
				cycle(worker.env, seed, SUCCESS_TIMER).then(function (job) {
					// Print the results
					printer({
						payload: payload,
						count: seed.payload.success,
						current_rate: rate,
						saved_data: data,
						job_id: job
					});
				}).catch(function (error) {
					printer({
						payload: payload,
						count: seed.payload.success,
						current_rate: rate,
						saved_data: data,
						message: error
					});
				});
			} else {
				// Print end of cycle and completed results
				printer({
					payload: payload,
					count: seed.payload.success,
					current_rate: rate,
					saved_data: data
				});
			}

			callback('success');
		}).catch(function (error) {
			if (++seed.payload.fail < FAILURE_MAX) {
				cycle(worker.env, seed, FAILURE_TIMER).then(function (job) {
					printer({
						payload: payload,
						count: seed.payload.fail,
						message: error,
						job_id: job
					});
				}).catch(function (rate_error) {
					// Print failure messages
					printer({
						payload: payload,
						count: seed.payload.failure,
						rate_error: error,
						message: rate_error
					});
				});
			} else {
				// Print end of cycle and failure messages
				printer({
					payload: payload,
					count: seed.payload.failure,
					rate_error: error
				});
			}

			callback('success');
		});
	};

  // Cycling iterations for the worker
  function cycle(env, seed, delay) {
  let worker_producer = new WorkerProducer(env);
  return worker_producer.put(seed, delay);
}

module.exports = ExchangeHelper;
})();
