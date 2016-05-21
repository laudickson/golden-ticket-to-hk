'use strict';

(function () {
	// Declare imports
	let Promise = require('bluebird');
	let co = require('co');
	let $ = require('cheerio');
	let mongoose = Promise.promisifyAll(require('mongoose'));
	let request = Promise.promisify(require('request'));
	let ExchangeRate = Promise.promisifyAll(require('./exchange_rate'));
	let WorkerProducer = require('./producer_worker');
	let Seed = require('./seed');

	const LIMIT_SUCCESS = 10;
	const LIMIT_FAILURE = 3;

	const DELAY_SUCCESS = 60;
	const DELAY_FAILURE = 3;

	/**
	 * create constructor for seeding the project. Job initializiation
	 */
	function Exchanger(user) {
		this.type = 'exchange_rate';
		this.user = user;
	}

	/**
	 * Function: The work flow of type <exchange_rate>
	 */
	HandlerExchangeRate.prototype.work = function (payload, callback) {
		// Make a new the seed
		let seed = new Seed(payload.from, payload.to, payload.success, payload.success);
		let user = this.user;

		co(function* () {
			// Test mongodb connection
			yield mongoReady(owner.mongo_uri);
			// Get exchange rate
			let exchange_rate = yield getExchangeRate(payload.from, payload.to);
			// Save to mongo
			let data = yield saveToMongo(payload.from, payload.to, exchange_rate, new Date());
			// Reput if success less than 10 times
			if (++seed.payload.count_success < LIMIT_SUCCESS) {
				reput(owner.config, seed, DELAY_SUCCESS).then(function (jobid) {
					// Get exchange rate and reput success, log it
					log({
						enable: owner.enable_log,
						payload: payload,
						count: seed.payload.count_success,
						exchange_rate: exchange_rate,
						saved_data: data,
						reput_jobid: jobid
					});
				}).catch(function (reput_err) {
					// Get exchange rate success and reput failure, log it
					log({
						enable: owner.enable_log,
						payload: payload,
						count: seed.payload.count_success,
						exchange_rate: exchange_rate,
						saved_data: data,
						reput_err: reput_err
					});
				});
			} else {
				// Get exchange rate success and job finished, log it
				log({
					enable: owner.enable_log,
					payload: payload,
					count: seed.payload.count_success,
					exchange_rate: exchange_rate,
					saved_data: data
				});
			}

			callback('success');
		}).catch(function (err) {
			// Get exchange rate failure
			// Reput if failure less than 3 times
			if (++seed.payload.count_failure < LIMIT_FAILURE) {
				reput(owner.config, seed, DELAY_FAILURE).then(function (jobid) {
					// Get exchange rate failure and reput success, log it
					log({
						enable: owner.enable_log,
						payload: payload,
						count: seed.payload.count_failure,
						exchange_rate_err: err,
						reput_jobid: jobid
					});
				}).catch(function (reput_err) {
					// Get exchange rate and reput failure, log it
					log({
						enable: owner.enable_log,
						payload: payload,
						count: seed.payload.count_failure,
						exchange_rate_err: err,
						reput_err: reput_err
					});
				});
			} else {
				// Get exchange rate failure and give job, log it
				log({
					enable: owner.enable_log,
					payload: payload,
					count: seed.payload.count_failure,
					exchange_rate_err: err
				});
			}

			callback('success');
		});
	};

	/**
	 * Function: Yield after mongodb is connected
	 * @param {string} mongo_uri - the mongodb URI
	 */
	function mongoReady(mongo_uri) {
		return co(function* () {
			if (mongoose.connection.readyState) {
				// If ready, yield true
				yield Promise.resolve(mongoose.connection.readyState);
			} else {
				// If not ready, yield after connection open
				mongoose.connect(mongo_uri);
				yield mongoose.connection.onceAsync('open').timeout(10 * 1000);
			}
		});
	}

	/**
	 * Function: Get the exchange rate from xe.com
	 * @param {string} from - exchange rate from which country
	 * @param {string} to - exchange rate to which country
	 * @return {Promise} - if success, return the exchange_rate {Number}, else return the error {String}
	 */
	function getExchangeRate(from, to) {
		return new Promise(function (resolve, reject) {
			let url = `http://www.xe.com/currencyconverter/convert/?From=${from}&To=${to}`;
			request(url).spread(function (response, body) {
				// Scrap the string contain the exchange rate
				// Example: '1 HKD = 0.129032 USD'
				let exchange_rate_line = $(body).find('.uccResUnit').find('.rightCol').text();

				// Use regex to get the exchange rate
				let regex = new RegExp(`1\\s${to}\\s=\\s(.*)\\s${from}`);
				let search_result = exchange_rate_line.match(regex);

				if (search_result === null) {
					// If search_result is null,
					// Reject it
					reject(`Cannot get exchange rate, invalid 'from' or 'to'`);
				} else {
					// If search result is valid,
					// Get the exchange rate and round off to 2 decmicals in STRING type.
					let exchange_rate = Number(exchange_rate_line.match(regex)[1]).toFixed(2).toString();
					// Resolve it
					resolve(exchange_rate);
				}
			}).catch(function (err) {
				// Error
				reject(err);
			});
		});
	}

	/**
	 * Function: Save the exchange rate to mongo
	 * @param {string} from - exchange rate from which country
	 * @param {string} to - exchange rate to which country
	 * @param {string} exchange_rate - the exchange rate
	 * @param {string} created_at - creation time of the data
	 * @return {Promise} - if success, return the saved data {Object}, else return the error {String}
	 */
	function saveToMongo(from, to, exchange_rate, created_at) {
		return new Promise(function (resolve, reject) {
			// Create a new ExchangeRate and save to mongodb
			new ExchangeRate({
				from: from,
				to: to,
				created_at: created_at,
				rate: exchange_rate
			}).saveAsync().then(function (data) {
				resolve(data);
			}).catch(function (err) {
				reject(err);
			});
		});
	}


	/**
	 * Function: Reput the seed with delay
	 * @param {object} config - the configuration of the producer, {host, port, tube_name}, example see 'config.js'
	 * @param {Seed} seed - the seed
	 * @param {number} delay - the time to delay the process
	 * @return {Promise} - if success, return the jobid {Number}, else return the error {String}
	 */
	function reput(config, seed, delay) {
		let worker_producer = new WorkerProducer(config);
		return worker_producer.put(seed, delay);
	}

	/**
	 * Function: Log the working status
	 * @param {object} option - the log option
	 * {
	 *		enable: {bool} enable log
	 *		payload: {object} the payload
	 *	 	count: {number} the success count or failure count
	 *		[exchange_rate_err]: {string} error of getting exchange rate, pass null if get exchange rate fail
	 *		[exchange_rate]: {string} the exchange rate, pass null if get exchange rate fail
	 *		[saved_data]: {object} the object saved to mongodb
	 *		[reput_err]: {string} error of reputting the seed
	 *		[reput_jobid]: {string} jobid of the reput seed
	 * }
	 */
	function log(option) {
		// Return if not enable log
		if (!option.enable) {
			return;
		}

		// Log the payload
		console.log('====================');
		console.log(`HandlerExchangeRate: Working on payload - payload: ${JSON.stringify(option.payload)}`);

		if (option.exchange_rate) {
			// Get exchange rate success
			console.log(`HandlerExchangeRate: Get exchange rate success - exchange_rate: '${option.exchange_rate}'`);
			console.log(`HandlerExchangeRate: Saved to mongo - id: '${option.saved_data[0]._id}'`);
			if (option.count >= LIMIT_SUCCESS) {
				console.log(`HandlerExchangeRate: Success ${option.count} times, finish job`);
			} else if (option.reput_jobid) {
				console.log(`HandlerExchangeRate: Success ${option.count} times, reput seed with jobid: '${option.reput_jobid}'`);
			} else {
				console.log(`HandlerExchangeRate: Success ${option.count} times, reput seed failure - Error: ${option.reput_err}`);
			}
		} else {
			// Get exchange rate failure
			console.log(`HandlerExchangeRate: Get exchange rate failure - Error: ${option.exchange_rate_err}`);
			if (option.count >= LIMIT_FAILURE) {
				console.log(`HandlerExchangeRate: Failure ${option.count} times, give up jobs`);
			} else if (option.reput_jobid) {
				console.log(`HandlerExchangeRate: Failure ${option.count} times, reput seed with jobid: '${option.reput_jobid}'`);
			} else {
				console.log(`HandlerExchangeRate: Failure ${option.count} times, reput seed failure - Error: ${option.reput_err}`);
			}
		}
	}

	module.exports = HandlerExchangeRate;
})();
