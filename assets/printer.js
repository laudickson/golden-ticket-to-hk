'use strict';

// Something to make the output look pretty
(function printer(option) {
  let $ = require('cheerio');

  console.log('====================');
  console.log(`From: '${option.payload.from}'`)
  console.log(`"To: '${option.payload.to}'"`)

  if (option.exchange_rate) {
    // Successful iteration results
    console.log(`Current rate: '${option.exchange_rate}'`);
    console.log(`mongo_id: '${option.saved_data[0]._id}'`);
    if (option.count >= LIMIT_SUCCESS) {
      console.log(`${option.count} successful iterations. My job here is done, bye! :)`);
    } else if (option.job_id) {
      console.log(`${option.count} successful iterations. Cycling next iteration with job_id: '${option.reput_jobid}'`);
    } else {
      console.log(` ${option.count} successful iterations.
        Something went wrong :( - Error: ${option.reput_err}`);
    }
  } else {
    // Failed iteration results
    console.log(`HandlerExchangeRate: Get exchange rate failure - Error: ${option.rate_error}`);
    if (option.count >= LIMIT_FAILURE) {
      console.log(`${option.count} successive failures. I'm quitting this job! :(`);
    } else if (option.reput_jobid) {
      console.log(`${option.count} successive failures. Retrying with jobid: '${option.reput_jobid}'`);
    } else {
      console.log(`${option.count} successive failures. Something went wrong :( - Error: ${option.reput_err}`);
    }
  }
}

module.exports = Printer;
})();
