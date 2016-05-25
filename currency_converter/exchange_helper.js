'use strict';

// Obtains currency exchange rates from xe.com
(function ExchangeHelper(from, to) {
  return new Promise(function (resolve, reject) {
    let url = `http://www.xe.com/currencyconverter/convert/?From=${from}&To=${to}`;
    request(url).spread(function (response, body) {
      let exchange_rate_line = $(body).find('.uccResUnit').find('.rightCol').text();

      // Trimming the string
      let regex = new RegExp(`1\\s${to}\\s=\\s(.*)\\s${from}`);
      let search_result = exchange_rate_line.match(regex);

      if (search_result === null) {
        reject(`Cannot get exchange rate, invalid 'from' or 'to'`);
      } else {
        let exchange_rate = Number(exchange_rate_line.match(regex)[1]).toFixed(2).toString();
        resolve(exchange_rate);
      }
    }).catch(function (err) {
      reject(err);
    });
  });

  module.exports = ExchangeHelper;
})();
