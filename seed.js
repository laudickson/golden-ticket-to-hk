(function(){
  'use strict';

  function seed(from, to){
    this.type = 'currency'
    this.payload = {
      from: from,
      to: to,
      success: 0,
      failure: 0
    }
  }
  module.exports = Seed;
})();
