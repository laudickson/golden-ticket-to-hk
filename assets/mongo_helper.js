'use strict';

(function mongoHelper(mongo_url) {
	let Promise = require('bluebird');
	let mongoose = Promise.promisifyAll(require('mongoose'));

  return co(function* () {
    if (mongoose.connection.readyState) {
      yield Promise.resolve(mongoose.connection.readyState);
    } else {
      // If not ready, yield after connection open
      mongoose.connect(mongo_url);
      yield mongoose.connection.onceAsync('open').timeout(10 * 1000);
    }
  });

  module.exports = mongoHelper;
})();
