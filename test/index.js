
var should = require('chai').should(),
    ref = require('ref'),
    client = require('../index');

describe('#client.lock', function() {
    it('Zymkey lock/unlock with local key.', function() {
        var srcBuf = new Buffer('hello, world');
        var lockedBuf = client.lock(srcBuf);
        var unlockedBuf = client.unlock(lockedBuf);
        srcBuf.equals(unlockedBuf).should.equal(true);
    });
});
