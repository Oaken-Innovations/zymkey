
var client = require('./index.js')

ret = client.ledOff();
console.log('LEDOff returned ' + ret);

var srcBuf = new Buffer('hello, world');
lockedBuf =  client.lock(srcBuf);
console.log('Locked data: \n\t' + lockedBuf.toString());

unlockedBuf = client.unlock(lockedBuf);
console.log('Unlocked data: ');
console.log('\t' + unlockedBuf.toString('utf-8'));

console.log('Buffer equals ' + srcBuf.equals(unlockedBuf));
