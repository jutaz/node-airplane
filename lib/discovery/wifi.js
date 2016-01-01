'use strict';

class Wifi {
  constructor (wifiData) {
    this.name = wifiData.name;
    this.channel = wifiData.channel;
    this.mac = wifiData.mac;
    this.frequency = wifiData.frequency;
  }

  toString () {
    return `Name: ${this.name}\nFrequency: ${this.frequency}\nChannel: ${this.channel}\nMAC: ${this.mac}`;
  }
}

module.exports = Wifi;
