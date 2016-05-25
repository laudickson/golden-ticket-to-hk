
Technologies incorporated:

[Node.js](https://nodejs.org/en/) (v4.2.1)

[beanstalkd](http://kr.github.io/beanstalkd/) via [fivebeans](https://github.com/ceejbot/fivebeans) to create workers for a beanstalkd

[mongoDB](https://www.mongodb.com) with [mongoose](http://mongoosejs.com) to save the data

[bluebird](http://bluebirdjs.com/docs/getting-started.html) with [co](https://github.com/tj/co) to create jobs for the workers

[cheerio](https://github.com/cheeriojs/cheerio) jQuery tool for Node.js

[request](https://github.com/request/request) simplified HTTP request client for obtaining exchange rate

This program serves as a simple currency converter using a worker to obtain and display exchange rates as a job. The worker finishes the job if:

    * it successfully obtains and displays the rate 10 successful times for each minute.
    * save the result to mongodb

    * or it fails to obtain and display the rate 3 times.
      * if it fails, retry it in 3 seconds

The default exchange rate included is HKD to USD.

Instructions:
* Clone this git into a directory
* Run `npm install`
* Seed the beanstalk with `node producer`
* Watch the consumer do its thing with `node consumer`
* Cross your fingers and hope the worker successfully finishes the job

Notes:

You can change the rate for different countries in the `producer.js` file of the root directory. Just change `'HKD'` and `'USD'` to countries of your choice (provided they are valid on [xe.com](http://www.xe.com))
