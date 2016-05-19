(function() {

	let Promise = require('bluebird');
	let Fivebeans = Promise.promisifyAll(require('fivebeans'));
	let HandlerCurrency = require('./handler_currency');

	// Constructor
	function WorkerConsumer(config) {
		this.config = config;
	}

	WorkerConsumer.prototype.start = function() {
		let options = {
			id: 'SOME_RANDOM_ID',
			host: this.config.host,
			port: this.config.port,
			handlers: {
				rate: new ExchangeRate(this)
			},
			ignoreDefault: true
		}

		let worker = new Fivebeans.worker(options);
		worker.start([this.config.tube_name]);
		console.log('The Consumer Worker has begun its job.');
	};

	module.exports = WorkerConsumer;
})();
