'use strict';
let AirportInfoRecord = require('./airportInfoRecord'),
    _ = require('lodash');

const messageTag = "acpp",
      unknownField1 = [0,0,0,1],
  	  messageChecksum = 0,
  	  payloadChecksum = 0,
  	  payloadSize = 0,
      unknownField2 = _.fill(Array(8), 0x00),
  	  messageType = 0,  // download = 0x14, upload = 0x15
      unknownField3 = _.fill(Array(16), 0x00),
      password = _.fill(Array(32), 0x00),
      unknownField4 = _.fill(Array(48), 0x00),
      READ = 0x14,
      WRITE = 0x15;

class AirportMessage {
  constructor (messageType, password, payloadBytes, payloadSize) {
    // set payload size and checksum
		if (messageType === READ) {
			this.payloadSize = payloadSize;
			this.payloadChecksum = this.computeChecksum(payloadBytes, payloadSize);
		} else {
			this.payloadSize = -1;
			this.payloadChecksum = 1;
		}

		// set message type
		this.messageType = messageType;

		// set encrypted password bytes
		this.password = _.map(_.fill(Array(32), 0), function (item, i) {
      if (password.substr(0, 31).split('')[i]) {
        return password.substr(0, 31).split('')[i].charCodeAt(0)
      }
      return item;
    });

		this.password = AirportInfoRecord.encryptBytes(AirportInfoRecord.cipherBytes, this.password);
		// get current message bytes, and use to compute checksum (including magic number)
		this.messageChecksum = this.computeChecksum(this.getBytes(), 128);
  }

  getBytes() {
		let outStream = [];

    let to2Bytes = function (num) {
      let arr = [];
      arr.push(num & 0xFF);
      arr.push((num >> 8) & 0xFF);
      arr.push((num >> 16) & 0xFF);
      arr.push((num >> 24) & 0xFF);
      return arr.reverse();
    }

		outStream = outStream.concat(messageTag.split('').map(function (item) {
      return item.charCodeAt(0);
    }));
		outStream = outStream.concat(unknownField1);
		outStream = outStream.concat(to2Bytes(this.messageChecksum || 0));
		outStream = outStream.concat(to2Bytes(this.payloadChecksum || 0));
		outStream = outStream.concat(to2Bytes(this.payloadSize));
		outStream = outStream.concat(unknownField2);
    // outStream = outStream.concat(0x00);
		outStream = outStream.concat(to2Bytes(this.messageType));
		outStream = outStream.concat(unknownField3);
		outStream = outStream.concat(this.password);
		outStream = outStream.concat(unknownField4);

    if (outStream.length < 128) {
      outStream = outStream.concat(_.fill(Array(128 - outStream.length), 0))
    }

		return outStream;
	}

  computeChecksum (fileBytes, length) {
		let checksum;

		// just multiply each byte by descending sequence
		//int length = fileBytes.length;

		let weightedChecksum = 0;
		let ordinaryChecksum = 0;

		for (let i = 0; i < length; i++) {
			let byteValue = fileBytes[i] || 0;

			if (byteValue < 0) {
        byteValue += 256;
      }

			ordinaryChecksum += byteValue;
			weightedChecksum += byteValue * (length - i);
		}

		ordinaryChecksum += 1;
		weightedChecksum += length;

		ordinaryChecksum = ordinaryChecksum & 0x0000FFFF;

		// boil checksum down to 16 bits
		while (weightedChecksum > 0x0000FFFF) {
			let upperHalf = (weightedChecksum & 0xFFFF0000) >> 16;
			let lowerHalf = (weightedChecksum & 0x0000FFFF);
			weightedChecksum = lowerHalf + (upperHalf * 0x0F);
		}

		checksum = ordinaryChecksum | (weightedChecksum << 16);

		return checksum;
	}
}

AirportMessage.messageTag = messageTag;
AirportMessage.unknownField1 = unknownField1;
AirportMessage.messageChecksum = messageChecksum;
AirportMessage.payloadChecksum = payloadChecksum;
AirportMessage.payloadSize = payloadSize,
AirportMessage.unknownField2 = unknownField2;
AirportMessage.messageType = messageType;
AirportMessage.unknownField3 = unknownField3;
AirportMessage.password = password;
AirportMessage.unknownField4 = unknownField4;
AirportMessage.READ = READ;
AirportMessage.WRITE = WRITE;

module.exports = AirportMessage;
