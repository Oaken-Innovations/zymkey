/*
 * Example of sign/verify using zymkey private key.
 */
var client = require('../index.js'),
    util = require('util');

var pubKeyBuf = client.getECDSAPubKey();
console.log('Zymkey public key is:\n\t' + pubKeyBuf.toString('hex'));

const msg = 'hello, world';
var sigBuf = client.sign(new Buffer(msg));
console.log(util.format('Signature of %s is:', msg));
console.log('\t' + sigBuf.toString('hex'));

var match = client.verify(new Buffer('hello, world'), sigBuf);
if (match) {
    console.log('Signature is valid.');
} else {
    console.log('Signature is invalid!');
}
