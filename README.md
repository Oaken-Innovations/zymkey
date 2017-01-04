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

* 01/04/2017 - 0.1.0 Inital Release

## Tasks

- [ ] Add support to node sign/verify (digest).
- [ ] Support get ramdom bytes.
- [ ] Add support to zymkey ECDSA (P256 Curve) key management.

## License

GPL-3.0
