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
  let Redo = require('../assets/redo')

	const SUCCESS_MAX = 10;
	const FAIL_MAX = 3;

	const SUCCESS_TIMER = 60;
	const FAILURE_TIMER = 3;

	/**
	 * Initialize the job
	 */
	function Exchanger(consumer_worker) {
		this.type = 'current_rate';
		this.worker = consumer_worker;
	}


	Exchanger.prototype.work = function (payload, callback) {
		let seed = new Seed(payload.from, payload.to, payload.success, payload.success);
		let worker = this.worker;

		co(function* () {
			yield mongoHelper(worker.mongo_url);

			let rate = yield RateHelper(payload.from, payload.to);
			let data = yield saveToMongo(payload.from, payload.to, rate, new Date());

			// Redo if success less than 10 times
			if (++seed.payload.success < SUCCESS_MAX) {
				redo(worker.env, seed, SUCCESS_TIMER).then(function (job) {
					// Get exchange rate and reput success, log it
					printer({
						payload: payload,
						count: seed.payload.success,
						current_rate: rate,
						saved_data: data,
						redo_job: job
					});
				}).catch(function (error_message) {
					// Get exchange rate success and reput failure, log it
					printer({
						payload: payload,
						count: seed.payload.success,
						current_rate: rate,
						save: data,
						error_message: error_message
					});
				});
			} else {
				// Get exchange rate success and job finished, log it
				printer({
					payload: payload,
					count: seed.payload.success,
					current_rate: rate,
					save: data
				});
			}

			callback('success');
		}).catch(function (error) {
			if (++seed.payload.fail < FAILURE_MAX) {
				redo(worker.env, seed, FAILURE_TIMER).then(function (job) {
					printer({
						payload: payload,
						count: seed.payload.fail,
						error_message: error,
						redo_job: job
					});
				}).catch(function (redo_error) {
					// Get exchange rate and reput failure, log it
					printer({
						payload: payload,
						count: seed.payload.failure,
						rate_error: error,
						redo_error: redo_error
					});
				});
			} else {
				// Get exchange rate failure and give job, log it
				printer({
					payload: payload,
					count: seed.payload.failure,
					rate_err: error
				});
			}

			callback('success');
		});
	};

  function redo(env, seed, delay) {
  let worker_producer = new WorkerProducer(env);
  return worker_producer.put(seed, delay);
}

module.exports = Exchanger;
})();
