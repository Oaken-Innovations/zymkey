/**
 * NodeJS wrapper of zymkey crypto module.
 */

const ref = require('ref'),
      ffi = require('ffi');

const crypto = require('crypto');

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
        'zkLockDataB2B': ['int', [zkPtr, 'void *', 'int', 'void **', 'int *', 'bool']],
        'zkUnlockDataB2B': ['int', [zkPtr, 'void *', 'int', 'void **', 'int *', 'bool']],
        'zkGetRandBytes': ['int', [zkPtr, 'void **', 'int']],
        'zkGenECDSASigFromDigest': ['int', [zkPtr, 'void *', 'int', 'void **', 'int *']],
        'zkVerifyECDSASigFromDigest': ['int', [zkPtr, 'void *', 'int', 'void *', 'int']],
        'zkGetECDSAPubKey': ['int', [zkPtr, 'void **', 'int *', 'int']],
        'zkSetI2CAddr': ['int', [zkPtr, 'int']],
        'zkSetTapSensitivity': ['int', [zkPtr, 'int', 'float']],
        'zkGetTime': ['int', [zkPtr, 'int *', 'bool']],
        'zkSetGMTTime': ['int', [zkPtr]],
        'zkLEDFlash': ['int', [zkPtr, 'ulong', 'ulong', 'ulong']]
    });

    var zkCtx = ref.alloc('pointer');
    var ret = zkLib.zkOpen(zkCtx);
    if (ret < 0) {
        throw new Error('zkOpen failed!');
    }

    self._zkLib = zkLib;
    self._zkCtx = zkCtx.deref();
};

/**
 * Retrieve ECDSA public key.
 *
 * @returns {Bufffer} - The public key buffer.
 */
ZymkeyClient.prototype.getECDSAPubKey = function () {
    var self = this;
    var dstRef = ref.alloc('pointer');
    var dstSizeRef = ref.alloc('int');
    var slot = 0; //TODO: to be changed
    var ret = self._zkLib.zkGetECDSAPubKey(self._zkCtx, dstRef, dstSizeRef, slot);
    if (ret < 0) {
        throw new Error('zkGetECDSAPubKey failed');
    }
    var pubKeyBuf = dstRef.readPointer(0, dstSizeRef.deref());
    return pubKeyBuf;
}

/**
 * Get ramdom bytes from TRNG of zymkey.
 *
 * @param {Number} numBytes - Number of bytes.
 * @returns {Buffer} - The random bytes in a buffer.
 */
ZymkeyClient.prototype.getRandBytes = function (numBytes) {
    var self = this;
    var randBytesRef = ref.alloc('pointer');
    var ret = self._zkLib.zkGetRandBytes(self._zkCtx, randBytesRef, numBytes);
    if (ret < 0) {
        throw new Error('zkGetRandBytes failed.');
    }

    randBytesBuf = randBytesRef.readPointer(0, numBytes);
    return randBytesBuf;
};

/**
 * Get current GMT time from Zymkey's Real Time Clock (RTC).
 *
 * @param {boolean} precise - If true, the API returns time after next second falls.
 *   If false, it returns immediately with current time reading.
 * @returns {Number} - The time in seconds from the epoch (Jan. 1, 1970).
 */
ZymkeyClient.prototype.getRTCTime = function (precise) {
    var self = this;
    var preciseChosen = typeof precise != 'undefined' ? precise : false; 
    var epochSecRef = ref.alloc('int');
    var ret = self._zkLib.zkGetTime(self._zkCtx, epochSecRef, preciseChosen);
    if (ret < 0) {
        throw new Error('zkGetTime failed.');
    }
    return epochSecRef.deref();
}

/**
 * Flash Zymkey's onboard LED.
 *
 * @param {Number} onMs - The time in milliseconds that the LED will be on for.
 * @param {Number} offMs - The time in milliseconds that the LED will be off for.
 * @param {Number} numFlashes - The number of on/off cycles to execute.
 *   If set to 0 (default), the LED will flash indefinitely.
 * @returns {boolean} True if success.
 */
ZymkeyClient.prototype.ledFlash = function (onMs, offMs, numFlashes) {
    var self = this;
    if ((onMs == 0) && (offMs == 0)) {
        throw new Error('Both onMs and offMs were set to 0.');
    }
    if (onMs == 0) {
        onMs = offMs;
    } else if (offMs == 0) {
        offMs = onMs;
    }

    var ret = self._zkLib.zkLEDFlash(self._zkCtx, onMs, offMs, numFlashes);
    if (ret < 0) {
        throw new Error('zkLEDFlash failed.');
    }
    return true;
};

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
    var encryption = typeof encryptionKey != 'undefined' ? encryptionKey : 'zymkey';
    var self = this;
    var use_shared_key = (encryption == 'cloud');
    
    var dstRef = ref.alloc('pointer');
    var dstSizeRef = ref.alloc('int');
    var ret = self._zkLib.zkLockDataB2B(self._zkCtx, srcBuf, srcBuf.length, 
            dstRef, dstSizeRef, use_shared_key);
    if (ret < 0) {
        throw new Error('zkLockDataB2B failed.'); 
    }
    
    var dstSize = dstSizeRef.deref();
    dstBuf = dstRef.readPointer(0, dstSize);
    //for (var pair of dstBuf.entries()) {
        //console.log(pair);
    //}
    return dstBuf;
};

/**
 * Set I2C address of Zymkey (apply only to I2C version)
 *
 * @param {Number} addr - The address to set.
 *     Default zymkey I2C address is 0x30. Valid ranges are 0x30 ~ 0x37, 0x60 ~ 0x67.
 * @returns {boolean} - Operation result.
 */
ZymkeyClient.prototype.setI2CAddress = function (addr) {
    var self = this;
    var ret = self._zkLib.zkSetI2CAddr(self._zkCtx, addr);
    if (ret < 0) {
        throw new Error('zkSetI2CAddr failed.');
    }
    return true;
}

/**
 * Set RTC time to system GMT time. Same as `hwclock -w`.
 *
 * @returns {boolean} - True if success.
 */
ZymkeyClient.prototype.setRTCTime = function () {
    var self = this;
    var ret = self._zkLib.zkSetGMTTime(self._zkCtx);
    if (ret < 0) {
        throw new Error('zkSetGMTTime failed.');
    }
    return true;
}

/**
 * Set tap sensitivity.
 *
 * @param {string} axis - The asix to configure. 
 *   'all': Set all axes with the given sensitivity.
 *   'x|X': Configure only x-axis.
 *   'y|Y': Configure only y-axis.
 *   'z|Z': Configure only z-axis.
 * @param {Number} percentage - The sensitivity in percentage.
 *   0: Disable tap detction.
 *   100: Maximum sensitivity.
 * @returns {boolean} True if succes.
 */
ZymkeyClient.prototype.setTapSensitivity = function (axis, percentage) {
    var self = this;
    axis = axis.toLowerCase();
    var axisChosen = 3;
    if (axis === 'x') {
        axisChosen = 0;
    } else if (axis === 'y') {
        axisChosen = 1;
    } else if (axis === 'z') {
        axisChosen = 2;
    } else if (axis === 'all') {
        axisChosen = 3;
    } else {
        throw new Error('Unsupported axis representation value ' + axis);
    }
    var ret = self._zkLib.zkSetTapSensitivity(self._zkCtx, axisChosen, percentage);
    if (ret < 0) {
        throw new Error('zkSetTapSentsiivity failed.');
    }
    return true;
}

/**
 * Sign data digest using Zymkey's ECDSA private key.
 *
 * @param {Buffer} src - The data to sign.
 * @returns {Buffer} - The signature data buffer.
 */
ZymkeyClient.prototype.sign = function (src) {
    var self = this;
    const sha256 = crypto.createHash('sha256').update(src);
    var dstRef = ref.alloc('pointer');
    var dstSizeRef = ref.alloc('int');
    const digestBuf = sha256.digest();
    var sigType = 0;    //TODO: to change
    var ret = self._zkLib.zkGenECDSASigFromDigest(self._zkCtx, digestBuf, sigType,
            dstRef, dstSizeRef);
    if (ret < 0) {
        throw new Error('zkGenECDSASigFromDigest failed.');
    }
    var sigBuf = dstRef.readPointer(0, dstSizeRef.deref());
    return sigBuf;
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
    var encryption = typeof encryptionKey != 'undefined' ? encryptionKey : 'zymkey';
    var self = this;
    var use_shared_key = (encryption == 'cloud');

    var dstRef = ref.alloc('pointer');
    var dstSizeRef = ref.alloc('int');
    var ret = self._zkLib.zkUnlockDataB2B(self._zkCtx, srcBuf, srcBuf.length, 
            dstRef, dstSizeRef, use_shared_key);
    if (ret < 0) {
        throw new Error('zkUnlockDataB2B failed.');
    }
    var dstSize = dstSizeRef.deref();
    dstBuf = dstRef.readPointer(0, dstSize);
    //for (var pair of dstBuf.entries()) {
        //console.log(pair);
    //}
    return dstBuf;
};

/**
 * Verify given src data against signature.
 *
 * @param {Buffer} src - Original/Challenge data buffer.
 * @param {Buffer} sig - Signature buffer.
 * @returns {boolean} - Valid signature or not.
 */
ZymkeyClient.prototype.verify = function (src, sig) {
    var self = this;
    const srcSha256 = crypto.createHash('sha256').update(src);
    var srcDigestBuf = srcSha256.digest();
    var sigType = 0; //TODO: to change.
    var ret = self._zkLib.zkVerifyECDSASigFromDigest(self._zkCtx, srcDigestBuf, sigType,
            sig, sig.length);
    return (ret==1);
}

module.exports = exports = new ZymkeyClient();

