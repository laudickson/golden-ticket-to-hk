'use strict';

// Seed schema
(function () {
	function Seed(from, to, success, fail) {
		this.type = 'exchange_rate';
		this.payload = {
			from: from,
			to: to,
			success: success || 0,
			fail: fail || 0
		};
	}

	module.exports = Seed;
})();
