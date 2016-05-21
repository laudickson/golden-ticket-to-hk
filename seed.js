'use strict';

(function () {
	function Seed(from, to, success, failure) {
		this.type = 'current_rate';
		this.payload = {
			from: from,
			to: to,
			success: success || 0,
			failure: failure || 0
		};
	}

	module.exports = Seed;
})();
