'use strict';

let Wifi = require('./wifi'),
    _ = require('lodash'),
    net = require('net'),
    Interface = require('../interface');

class Airport {
  constructor (service) {
    this.name = service.name;
    this.host = service.host;
    this.port = service.port;
    this.service = service;
    this.parseTxtRecord();
  }

  /**
   * This function parses TXT `waMA` record in airport broadcast data.
   * TXT record is as follows:
   * XX-XX-XX-XX-XX-XX,raMA=XX-XX-XX-XX-XX-XX,raM2=XX-XX-XX-XX-XX-XX,raNm=Name,raCh=36,rCh2=12,raSt=1,raNA=0,syFl=0x1080C,syAP=119,syVs=7.7.3,srcv=77300.1,bjSd=116
   * Mapping of values:
   *
   * - First 17 chars: Airport's MAC.
   * - `raMA` MAC address of 5Ghz WiFi.
   * - `raM2` MAC address of 2.4Ghz WiFi.
   * - `raNm` Name if WiFi.
   * - `raCh` Channel of 5Ghz WiFi.
   * - `rCh2` Channel of 2.4Ghz WiFi.
   * - `raSt` Is this airport a re-transmitter (i.e. Extends WiFi network)?
   * - `raNA` Is airport NAT switch?
   * - `syFl` No idea.
   * - `syAP` Maybe some internal airport mapping? As to where these airports map to in a map?
   * - `syVs` Airport's firmware version.
   * - `srcv` Airport's firmware source version (?).
   * - `bjSd` Something. Differs per airport.
   */
  parseTxtRecord () {
    let data = this.service.txtRecord.waMA,
        splitted = data.split(','),
        indexed;
    this.mac = splitted.shift();

    indexed = _(splitted).indexBy(function (item) {
      return _.chain(item).split('=').first().value();
    }).mapValues(function (item) {
      return _.chain(item).split('=').drop().join('=').value();
    }).value();

    this.position = indexed.syAP;
    this.version = indexed.syVs;
    this.sourceVersion = indexed.srcv;
    this.isNAT = ~~indexed.raNA === 1;

    this.wifi = {
      extends: ~~indexed.raSt === 1,
      five: new Wifi({
        name: indexed.raNm,
        channel: indexed.raCh,
        mac: indexed.raMA,
        frequency: 5
      }),
      two: new Wifi({
        name: indexed.raNm,
        channel: indexed.rCh2,
        mac: indexed.raM2,
        frequency: 2.4
      })
    }
  }

  connect (password) {
    // We only support ipv4 for now...
    let ipv4Address = _.find(this.service.addresses, (address) => {
      return net.isIPv4(address);
    })
    let iface = new Interface(ipv4Address, password);
    iface.connect();
    return iface;
  }
}

module.exports = Airport;
