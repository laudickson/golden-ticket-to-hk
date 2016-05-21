'use strict';

(function () {
	let mongoose = require('mongoose');
	let Schema = mongoose.Schema;

	let CurrentRate = new Schema({
		from: String,
		to: String,
		created_at: String,
		rate: String
	});

	module.exports = mongoose.model('CurrentRate', CurrentRate);
})();
