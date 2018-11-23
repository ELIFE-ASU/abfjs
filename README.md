# abf
A package for reading Axon Binary Format (ABF) files

| **Build Status**                                                                                |
|:-----------------------------------------------------------------------------------------------:|
| [![][travis-img]][travis-url] [![][appveyor-img]][appveyor-url] [![][codecov-img]][codecov-url] |

[travis-img]: https://travis-ci.com/dglmoore/abfjs.svg?branch=master
[travis-url]: https://travis-ci.com/dglmoore/abfjs

[appveyor-img]: https://ci.appveyor.com/api/projects/status/7iwikta8dus9e7gl/branch/master?svg=true
[appveyor-url]: https://ci.appveyor.com/project/dglmoore/abfjs/branch/master

[codecov-img]: https://codecov.io/gh/dglmoore/abfjs/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/dglmoore/abfjs

## Installation
```bash
npm install @dglmoore/abf
```

## Quickstart
```javascript
const ABF = require('@dglmoore/abf');
const abf = ABF('demo.abf');
abf.set_sweep(0);
console.log(abf.sweep_x);
console.log(abf.sweep_y);
```

## Acknowledgements
The abf package is and will continue to be heavily influenced by the [pyABF](https://github.com/swharden/pyABF) project.
