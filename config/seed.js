'use strict';

(function () {
	function Seed(from, to, success, fail) {
		this.type = 'current_rate';
		this.payload = {
			from: from,
			to: to,
			success: success || 0,
			fail: fail || 0
		};
	}

	module.exports = Seed;
})();
