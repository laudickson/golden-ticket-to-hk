(function() {

 	function Currency() {
 		this.type = 'currency';
 	}

 	Currency.prototype.work = function(payload, callback) {

 		console.log('HandlerCurrency: Working on payload')
 		console.log(payload);

 		// if ('SUCCESS') {
 		// 	// STORE IN MONGO
 		// 	if (++payload.success_count >= 10) {
 		// 		// DELETE
 		// 	} else {
 		// 		// REPUT WITH DELAY 60s
 		// 	}
 		// } else if ('FAIL') {
 		// 	if (++payload.fail_count >= 3) {
 		// 		// DELETE
 		// 	} else {
 		// 		// REPUT WITH DELAY 3s
 		// 	};
 		// };

 		callback('success');
 	};

 	module.exports = HandlerCurrency;
 })();
