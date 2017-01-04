# Zymkey NodeJS Library

A NodeJS wrapper for zymkey crypto library.

## Installation

```bash
npm install zymkey --save
```

## Usage 

```node
var client = require('zymkey');
var ret = client.ledOff();
console.log('Zymkey ledOff returned ' + ret);

var srcBuf = new Buffer('hello, world');
lockedBuf =  client.lock(srcBuf);
console.log('Locked data: \n\t' + lockedBuf.toString());

unlockedBuf = client.unlock(lockedBuf);
console.log('Unlocked data: ');
console.log('\t' + unlockedBuf.toString('utf-8'));

console.log('Buffer equals ' + srcBuf.equals(unlockedBuf));
```
## Examples

Take a look at the examples under `examples/` folder.

## Tests

All the test are under `test/`. And run test script by

```bash
npm test
```
## Release History

* `0.1.0` Inital Release (01/04/2017)

## Supported Zymkey Features

- [X] Manipulation (on/off/flash) of onboard LED.
- [X] ECDSA (*P256 curve only*) operations (getECDSAPubKey/sign/verify)
- [X] Data encrypt/decrypt using Zymkey private key.
- [X] Generate random bytes using Zymkey's True Random Number Generator (TRNG).
- [X] Access to Zymkey's Real Time Clock (RTC).
- [X] Access to Zymkey's Tap Detection Sensor.
- [X] Set Zymkey's I2C address.

## Acknowledgement

This project is based on [Zymbit](https://zymbit.com/zymkey/)'s trusted hardware modules.
Thanks to Zymbit's amazing technical supports and great product!   
And credits are given to the [node-ffi](https://github.com/node-ffi/node-ffi) and [ref](https://github.com/TooTallNate/ref) 
that enable calling Zymkey's C library in nodejs.

## License

GPL-3.0

## Copyright

Lex && [Oaken Team](https://github.com/Project-Oaken)


