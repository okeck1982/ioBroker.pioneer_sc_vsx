# ioBroker.pioneer_sc_vsx
<img src="admin/pioneer_sc_vsx.png" width="150px" alt="Logo">

[![NPM version](https://img.shields.io/npm/v/iobroker.pioneer_sc_vsx.svg)](https://www.npmjs.com/package/iobroker.pioneer_sc_vsx)
[![Downloads](https://img.shields.io/npm/dm/iobroker.pioneer_sc_vsx.svg)](https://www.npmjs.com/package/iobroker.pioneer_sc_vsx)
![Number of Installations](https://iobroker.live/badges/pioneer_sc_vsx-installed.svg)
![Current version in stable repository](https://iobroker.live/badges/pioneer_sc_vsx-stable.svg)

[![NPM](https://nodei.co/npm/iobroker.pioneer_sc_vsx.png?downloads=true)](https://nodei.co/npm/iobroker.pioneer_sc_vsx/)

## Tests
![Test and Release](https://github.com/okeck1982/ioBroker.pioneer_sc_vsx/workflows/Test%20and%20Release/badge.svg)
![Code QL](https://github.com/okeck1982/ioBroker.pioneer_sc_vsx/workflows/CodeQL/badge.svg)
![Super Linter](https://github.com/okeck1982/ioBroker.pioneer_sc_vsx/workflows/Lint%20Code%20Base/badge.svg)

## pioneer_sc_vsx adapter for ioBroker
Remote Control of Pioneer SC/VSX AV-Receiver

## Description
Remote Control a Pioneer SC / VSX AV receiver over Network.
The Adapter gets live status updates from the receiver and ioBroker can send control commands to it.

VSX devices up to model year 2016, like
* Pioneer VSX-S510
* Pioneer VSX-828
* Pioneer VSX-831
* Pioneer VSX-921
* Pioneer VSX-922
* Pionner VSX-923
more supported devices may be documented in former [app ControlApp of Pioneer](https://jpn.pioneer/ja/support/soft/iapp_controlapp/en.html#anp02)

Control commands can be found in [official doc of Pioneer](http://www.pioneerelectronics.com/StaticFiles/PUSA/Files/Home%20Custom%20Install/SC-37-RS232.pdf)

For newer models like Pioneer VSX-1151 please refer to [adapter with eiscp support](https://github.com/ioBroker/ioBroker.onkyo).

## Changelog
<!--
	Placeholder for the next version (at the beginning of the line):
	### **WORK IN PROGRESS**
-->

## **WORK IN PROGRESS**
- Updated README.md

### 0.0.2 (2022-02-11)
* (okeck1982) code optimization/refactoring
* (okeck1982) Added renameable input support. (display/set input by cutom name)
* (okeck1982) Added more documentation in code
* (Sneak-L8)  Added some documentation
* (Sneak-L8)  Fixed some typos
* (Sneak-L8)  Added volume up/down buttons
* (Sneak-L8)  Separate state for sending individual commands to device
* (Sneak-L8)  Support internet radio information's (station, bitrate, description, icon)
  
### 0.0.1 (2022-02-04)
* (okeck1982) initial release
  
## License
MIT License

Copyright (c) 2022 okeck1982 <97165003+okeck1982@users.noreply.github.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.