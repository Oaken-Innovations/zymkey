
var should = require('chai').should(),
    ref = require('ref'),
    client = require('../index');
/**
 * Test data encryption and decryption.
 */
describe('#client.lock', function() {
    it('Zymkey lock/unlock with local key.', function() {
        var srcBuf = new Buffer('hello, world');
        var lockedBuf = client.lock(srcBuf);
        var unlockedBuf = client.unlock(lockedBuf);
        srcBuf.equals(unlockedBuf).should.equal(true);
    });
});

/**
 * Test ECDSA sign and verify.
 */
describe('#client.sign', function () {
    it('Zymkey sign/verify that matches.', function () {
        const msg = 'hello, world';
        var sigBuf = client.sign(new Buffer(msg));
        var match = client.verify(new Buffer('hello, world'), sigBuf);
        match.should.equal(true);
    });

    it('Zymkey sign/verify that unmatches.', function () {
        const msg = 'hello, world';
        var sigBuf = client.sign(new Buffer(msg));
        var match = client.verify(new Buffer('Hello, world'), sigBuf);
        match.should.equal(false);
    });
});
