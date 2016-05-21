'use strict';

(function saveToMongo(from, to, exchange_rate, created_at) {
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

  module.exports saveToMongo;
})();
