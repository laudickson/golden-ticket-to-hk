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
