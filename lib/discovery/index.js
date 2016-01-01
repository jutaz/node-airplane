'use strict';

let EventEmitter = require('events').EventEmitter,
    mdns = require('mdns'),
    Airport = require('./airport');

const MDNS_AIRPORT_SERVICE = '_airport';

class Discovery extends EventEmitter {
  constructor () {
    super();
    this.airports = [];
    mdns.createBrowser(mdns.tcp(MDNS_AIRPORT_SERVICE)).on('serviceUp', this.onInfo.bind(this)).start();
  }

  onInfo (service, err) {
    let airport = new Airport(service);
    this.airports.push(airport);
    this.emit('airport', airport);
  }
}

module.exports = Discovery;
