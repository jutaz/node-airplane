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

  saveSettings () {
    return Promise.resolve().then(() => {
      if (!this.info) {
        return this.getInfo();
      }
      return this.info
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

      client.write(new Buffer(requestPayload));

      return this.readDataFromClient(client);
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
