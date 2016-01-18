'use strict';
let EventEmitter =  require('events').EventEmitter,
    net = require('net'),
    Promise = require('promise'),
    AirportInfoRecord = require('./airportInfoRecord'),
    AirportInfo = require('./airportInfo'),
    AirportMessage = require('./message'),
    utils = require('../utils');

class Interface extends EventEmitter {
  constructor (address, password) {
    super();
    this.address = address;
    this.password = password;
  }

  reboot () {
    let info = new AirportInfo().get('acRB').getUpdateBytes();

    return this.write(info);
  }

  setName (name) {
    return this.setSetting('syNm', name);
  }

  getName () {
    return this.getSetting('syNm').then(function (record) {
      return record.toString();
    });
  }

  setReadPassword (password) {
    return this.setSetting('syPR', password);
  }

  getReadPassword () {
    return this.getSetting('syPR').then(function (record) {
      return record.toString();
    });
  }

  setReadWritePassword (password) {
    return this.setSetting('syPR', password);
  }

  getReadWritePassword () {
    return this.getSetting('syPR').then(function (record) {
      return record.toString();
    });
  }

  setNetworkName (networkName) {
    return this.setSetting('raNm', networkName);
  }

  getNetworkName () {
    return this.getSetting('raNm').then(function (record) {
      return record.toString();
    });
  }

  // Cannot be done.
  // setPrivateLanAddress (password) {}

  getPrivateLanAddress () {
    return this.getSetting('laIP').then(function (record) {
      return record.toString();
    });
  }

  // Cannot be done.
  // setPrivateLanSubnet (password) {}

  getPrivateLanSubnet () {
    return this.getSetting('laSM').then(function (record) {
      return record.toString();
    });
  }

  setBridgingSwitch (switchVal) {
    return this.setSetting('raWB', switchVal ? [1] : [0]);
  }

  getBridgingSwitch () {
    return this.getSetting('raWB').then(function (record) {
      return !!record.value[0];
    });
  }

  // Cannot be done.
  // setStationIP () {}

  getStationIP () {
    return this.getSetting('waIP').then(function (record) {
      return record.toString();
    });
  }

  // Cannot be done.
  // setRouterIP () {}

  getRouterIP () {
    return this.getSetting('waRA').then(function (record) {
      return record.toString();
    });
  }

  // Cannot be done.
  // setSubnetMask () {}

  getSubnetMask () {
    return this.getSetting('waSM').then(function (record) {
      return record.toString();
    });
  }

  setContactPersonName (name) {
    return this.setSetting('syCt', name);
  }

  getContactPersonName () {
    return this.getSetting('syCt').then(function (record) {
      return record.toString();
    });
  }

  setStationLocation (location) {
    return this.setSetting('syLo', location);
  }

  getStationLocation () {
    return this.getSetting('syLo').then(function (record) {
      return record.toString();
    });
  }

  setDHCPRangeStart (rangeStart) {
    return this.setSetting('dhBg', rangeStart);
  }

  getDHCPRangeStart () {
    return this.getSetting('dhBg').then(function (record) {
      return record.toString();
    });
  }

  setDHCPRangeEnd (rangeEnd) {
    return this.setSetting('dhEn', rangeEnd);
  }

  getDHCPRangeEnd () {
    return this.getSetting('dhEn').then(function (record) {
      return record.toString();
    });
  }

  setSetting (key, value) {
    return Promise.resolve().then(() => {
      if (!this.info) {
        return this.getInfo();
      }
      return this.info
    }).then((info) => {
      let record = info.get(key);
      record.setValue(utils.toByteArray(value));
      info.set(key, record);
      return record;
    });
  }

  getSetting (key) {
    return Promise.resolve().then(() => {
      if (!this.info) {
        return this.getInfo();
      }
      return this.info
    }).then((info) => {
      return info.get(key);
    });
  }

  saveSettings () {
    return Promise.resolve().then(() => {
      if (!this.info) {
        return this.getInfo();
      }
      return this.info;
    }).then((info) => {
      return this.write(info.getUpdateBytes());
    });
  }

  getInfo () {
    return this.read(new AirportInfo().getRequestBytes()).then((info) => {
      this.info = info;
      return info;
    });
  }

  read (requestPayload) {
    let requestMessage = new AirportMessage(AirportMessage.READ, this.password, requestPayload, requestPayload.length);

    return this.connect().then((client) => {
      client.write(new Buffer(requestMessage.getBytes()));

      client.write(new Buffer(requestPayload));

      return this.readDataFromClient(client);
    });
  }

  write (requestPayload) {
    let requestMessage = new AirportMessage(AirportMessage.WRITE, this.password, requestPayload, requestPayload.length);

    return this.connect().then((client) => {
      client.write(new Buffer(requestMessage.getBytes()));

      client.end(new Buffer(requestPayload));
    });
  }

  readDataFromClient (client) {
    let dataBuffer = [];
    return new Promise((resolve, reject) => {
      client.on('data', (data) => {
        dataBuffer = dataBuffer.concat(data);
      });

      client.on('error', (err) => {
        reject(err);
        client.end();
      });

      client.on('end', () => {
        let data = utils.bufferToArray(Buffer.concat(dataBuffer)),
            handshakeBlock = data.splice(0, 128);

        if (data.length > 0) {
          return resolve(new AirportInfo(data));
        }
        return resolve();
      });
      // Resume reading of data.
      client.resume();
    })
  }

  connect () {
    return new Promise((resolve, reject) => {
      let client = net.connect({
        port: 5009,
        host: this.address
      }, function () {
        // Pauses Reading of data.
        client.pause();
        resolve(client);
      });
    });
  }
}

module.exports = Interface;
