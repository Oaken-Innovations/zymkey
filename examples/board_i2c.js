/**
 * Examples of usage of zymkey onboard resource.
 */
var client = require('../index');

var ret = client.ledFlash(1000, 1000, 10);
console.log('ledFlash returns ' + ret);

ret = client.setI2CAddress(0x30);
console.log('setI2CAddress returns', ret);

ret = client.setTapSensitivity('all', 50);
console.log('setTapSensitivitwy returns ' + ret);

// -$- RTC time -$-
ret = client.setRTCTime();
console.log('setRTCTime returns ' + ret);

var epoch = client.getRTCTime();
console.log(new Date(epoch*1000));


