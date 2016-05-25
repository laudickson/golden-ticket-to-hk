'use strict';

// Prepares schema
(function () {
  let mongoose = require('mongoose');
  let Schema = mongoose.Schema;
  let CurrentRate = new Schema({
    from: String,
    to: String,
    created_at: String,
    rate: String
  }, {
    versionKey: false
  });

 module.exports = mongoose.model('CurrentRate', CurrentRate);
})();
