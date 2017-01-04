/**
 * Example of random bytes generation of zymkey.
 */

var client = require('../index.js')

var randBytesBuf = client.getRandBytes(8);
for (var pair of randBytesBuf.entries() ) {
    console.log(pair);
}
