/**
 * Put the program into delay for a specific time.
 * @param {number} second - duration of sleep in second.
 * @returns {Promise} - A promise that returns nothing
 */
function delay(second){
    var second = second * 1000;
    return new Promise(function(resolve, reject){
        setTimeout(function() {
            resolve();
        }, second);
    });
}
