/**
 * NodeJS wrapper of zymkey crypto module.
 */

var ref = require('ref'),
    ffi = require('ffi');

var zkVoid = ref.types.void,
    zkPtr = ref.refType(zkVoid),
    zkPtrPtr = ref.refType(zkPtr);

/**
 * Nodejs zymkey client.
 *
 * @constructor
 */
function ZymkeyClient() {
    var self = this; 
    var zkLib = ffi.Library('/usr/local/lib/libzk_app_utils.so', {
        'zkOpen': ['int', [zkPtrPtr]],
        'zkLEDOn': ['int', [zkPtr]],
        'zkLEDOff': ['int', [zkPtr]],
        'zkLockDataB2B': ['int', [zkPtr, 'void *', 'int', 'void **', 'int*', 'bool']],
        'zkUnlockDataB2B': ['int', [zkPtr, 'void *', 'int', 'void **', 'int*', 'bool']]
    });

    var zkCtx = ref.alloc('pointer');
    var ret = zkLib.zkOpen(zkCtx);
    if (ret < 0) {
        throw new Error('zkOpen failed!');
    }

    self._zkLib = zkLib;
    self._zkCtx = zkCtx.deref();
}

/**
 * Zymkey turn LED off.
 *
 * @returns {Number} - Return 0 if operation succeeds.
 */
ZymkeyClient.prototype.ledOff = function() {
    var self = this;
    return self._zkLib.zkLEDOff(self._zkCtx);
};

/**
 * Zymkey turn LED on.
 *
 * @returns {Number} - Returns 0 if operation succeeds.
 */
ZymkeyClient.prototype.ledOn = function() {
    var self = this;
    return self._zkLib.zkLEDOn(self._zkCtx);
};

/**
 * Lock/Encrypt data using zymkey hardware crypto module (AES). 
 *
 * @param {Buffer} srcBuf - Source data buffer.
 * @param {string} encryptionKey - The type of the encryption key. Choose from 
 *      'zymkey' and 'cloud', which represents local and shared key correspondingly.
 * @returns {Buffer} The encrypted data.
 */
ZymkeyClient.prototype.lock = function(srcBuf, encryptionKey) {
    var encryption = typeof encryptionKey != 'underfined' ? encryptionKey : 'zymkey';
    var self = this;
    var use_shared_key = (encryption == 'cloud');
    
    var dstRef = ref.alloc('pointer');
    var dstSizeRef = ref.alloc('int');
    var ret = self._zkLib.zkLockDataB2B(self._zkCtx, srcBuf, 12, 
            dstRef, dstSizeRef, use_shared_key);
    if (ret < 0) {
        throw Except('zkLockDataB2B failed.'); 
    }
    
    var dstSize = dstSizeRef.deref();
    dstBuf = dstRef.readPointer(0, dstSize);
    //for (var pair of dstBuf.entries()) {
        //console.log(pair);
    //}
    return dstBuf;
};

/**
 * Unlock/Decrypt data using Zymkey hardware crypto module.
 *
 * @param {Buffer} srcBuf - Souce data buffer.
 * @param {string} encryptionKey - The type of the encryption key. Choose from 
 *      'zymkey' and 'cloud', which represents local and shared key correspondingly.
 * @returns {Buffer} - Unlocked/decrypted data buffer.
 */
ZymkeyClient.prototype.unlock = function(srcBuf, encryptionKey) {
    var encryption = typeof encryptionKey != 'underfined' ? encryptionKey : 'zymkey';
    var self = this;
    var use_shared_key = (encryption == 'cloud');

    var dstRef = ref.alloc('pointer');
    var dstSizeRef = ref.alloc('int');
    var ret = self._zkLib.zkUnlockDataB2B(self._zkCtx, srcBuf, srcBuf.length, 
            dstRef, dstSizeRef, use_shared_key);
    if (ret < 0) {
        throw Except('zkUnlockDataB2B failed.');
    }
    var dstSize = dstSizeRef.deref();
    dstBuf = dstRef.readPointer(0, dstSize);
    //for (var pair of dstBuf.entries()) {
        //console.log(pair);
    //}
    return dstBuf;
};

module.exports = exports = new ZymkeyClient();

