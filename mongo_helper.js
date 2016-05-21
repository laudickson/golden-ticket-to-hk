function mongoReady(mongo_uri) {
  return co(function* () {
    if (mongoose.connection.readyState) {
      // If ready, yield true
      yield Promise.resolve(mongoose.connection.readyState);
    } else {
      // If not ready, yield after connection open
      mongoose.connect(mongo_uri);
      yield mongoose.connection.onceAsync('open').timeout(10 * 1000);
    }
  });
}
