'use strict';
let _ = require('lodash'),
    AirportInfoRecord = require('./airportInfoRecord.js'),
    utils = require('../utils');

const MAX_NUM_MAC_ADDRESSES = 256,
      MAX_NUM_PORT_MAPS = 20,
      MAX_NUM_SNMP_ACCESS_ENTRIES = 5,
      MAX_NUM_LOGIN_CHARS = 127;

class AirportInfo extends Map {
  constructor (retrievedBytes) {
    super();
    this.initializeHashtable();

    if (!retrievedBytes) {
      return;
    }

    let count = 0;
		let invalidBytes = [0xFF, 0xFF, 0xFF, 0xF6];

    let chunk;

		while (retrievedBytes.length > 0) {
			// read the tag
      let tagBytes = retrievedBytes.splice(0, 4);
			let tag = utils.byteArrayToString(tagBytes);

			// break if tag is all zeros: end of info in array
			if (tag === "\0\0\0\0") {
        break;
      }

			// get the corresponding element
			let element = this.get(tag);
			// increment count; used at end to determine if we got any valid info
			count++;

			// check to make sure the element's not null, in case have received
			// unknown tag: just ignore if null
			if (element) {
				//read the encryption
				let encryptionBytes = retrievedBytes.splice(0, 4);
				element.encryption = this.getIntegerValue(encryptionBytes);

				//read the length
				let lengthBytes = retrievedBytes.splice(0, 4);
				let length = this.getIntegerValue(lengthBytes);

				//read the value
				let valueBytes = retrievedBytes.splice(0, length);

				if (element.encryption == AirportInfoRecord.ENCRYPTED) {
          valueBytes = AirportInfoRecord.decryptBytes(AirportInfoRecord.cipherBytes, valueBytes);
        }

				// check if the value being sent is 0xFFFFFF6; this indicates
				// the current value is invalid - just leave as 0. Ignore for
				// IP addresses, though...
				if (_.difference(valueBytes, invalidBytes).length !== 0 || element.dataType === AirportInfoRecord.IP_ADDRESS) {
          element.value = valueBytes;
        }
			} else {
				// just add an entry in hashtable
				element = new AirportInfoRecord();

				// assign the tag
				element.tag = tag;
				//read the encryption
				let encryptionBytes = retrievedBytes.splice(0, 4);
				element.encryption = this.getIntegerValue(encryptionBytes);
				//read the length
				let lengthBytes = retrievedBytes.splice(0, 4);
				let length = this.getIntegerValue(lengthBytes);
				element.maxLength = length;

				//read the value
				let valueBytes = retrievedBytes.splice(0, length)

				if (element.encryption === AirportInfoRecord.ENCRYPTED) {
          valueBytes = AirportInfoRecord.decryptBytes(AirportInfoRecord.cipherBytes, valueBytes);
        }

				// check if the value being sent is 0xFFFFFF6; this indicates
				// the current value is invalid - just leave as 0. Ignore for
				// IP addresses, though...
				if (_.difference(valueBytes, invalidBytes).length !== 0 || element.dataType === AirportInfoRecord.IP_ADDRESS) {
					element.value = valueBytes;
				} else {
					element.value = new Array(element.maxLength);
        }

				// add the element
				this.put(tag, element);
			}
    }
  }

  initializeHashtable () {
    // populate the hashtable
		let maxSize;
		let dataType;
		let encryption;
		let description;
		let tag;


		//	Trap community password: omitted




		//	Read community password:

		maxSize = 32;
		dataType = AirportInfoRecord.CHAR_STRING;
		encryption = AirportInfoRecord.ENCRYPTED;
		description = "Read community";
		tag = "syPR";

		this.put(tag, new AirportInfoRecord(tag, description, dataType, encryption, maxSize));


		//	Read/write community password:


		maxSize = 32;
		dataType = AirportInfoRecord.CHAR_STRING;
		encryption = AirportInfoRecord.ENCRYPTED;
		description = "Read/write community";
		tag = "syPW";

		this.put(tag, new AirportInfoRecord(tag, description, dataType, encryption, maxSize));



		//	Remaining community password count: omitted




		//	Remaining community password: omitted



		//	Configuration mode switch:
		//		Modem config:     00 00 09 00
		//		Ethernet manual:  00 00 04 00
		//		Ethernet DHCP:    00 00 03 00
		//		Ethernet PPPoE:   00 00 09 00
		//


		maxSize = 4;
		dataType = AirportInfoRecord.BYTE_STRING;
		encryption = AirportInfoRecord.UNENCRYPTED;
		description = "Configuration mode";
		tag = "waCV";

		this.put(tag, new AirportInfoRecord(tag, description, dataType, encryption, maxSize));



		//	Ethernet/Modem switch:
		//		00000004 = modem
		//		00000010 = Ethernet (hex)

		maxSize = 4;
		dataType = AirportInfoRecord.BYTE_STRING;
		encryption = AirportInfoRecord.UNENCRYPTED;
		description = "Ethernet/Modem switch 1";
		tag = "waIn";

		this.put(tag, new AirportInfoRecord(tag, description, dataType, encryption, maxSize));






		// 	Microwave robustness flag:
		//			00 = off
		//			01 = on


		maxSize = 1;
		dataType = AirportInfoRecord.BYTE;
		encryption = AirportInfoRecord.UNENCRYPTED;
		description = "Microwave robustness flag";
		tag = "raRo";
		this.put(tag, new AirportInfoRecord(tag, description, dataType, encryption, maxSize));



		// 	RTS/CTS flag: not present



		// 	Closed network flag:
		//			00 = open
		//			01 = closed

		maxSize = 1;
		dataType = AirportInfoRecord.BYTE;
		encryption = AirportInfoRecord.UNENCRYPTED;
		description = "Closed network flag";
		tag = "raCl";
		this.put(tag, new AirportInfoRecord(tag, description, dataType, encryption, maxSize));



		//	Deny unencrypted data flag:	not present





		//	Access point density, multicast rate:
		//
		//		Multicast rate: 01 = 1 Mbps, 02 = 2 Mbps, 55 = 5.5 Mbps, 11 = 11 Mbps - all hex
		//		Density: 1 = low, 2 = medium, 3 = high
		//
		//				   large  medium   small
		//		1 Mbps		OK		OK		OK
		//		2 Mbps		OK		OK		OK
		//		5.5 Mbps	na		OK		OK
		//		11 Mbps		na		na		OK

		maxSize = 4;
		dataType = AirportInfoRecord.BYTE_STRING;
		encryption = AirportInfoRecord.UNENCRYPTED;
		description = "Access point density";
		tag = "raDe";
		this.put(tag, new AirportInfoRecord(tag, description, dataType, encryption, maxSize));

		maxSize = 4;
		dataType = AirportInfoRecord.BYTE_STRING;
		encryption = AirportInfoRecord.UNENCRYPTED;
		description = "Multicast rate";
		tag = "raMu";
		this.put(tag, new AirportInfoRecord(tag, description, dataType, encryption, maxSize));





		//	Select encryption key to use: not present



		//	Wireless channel:

		maxSize = 4;
		dataType = AirportInfoRecord.UNSIGNED_INTEGER;
		encryption = AirportInfoRecord.UNENCRYPTED;
		description = "Wireless channel";
		tag = "raCh";
		this.put(tag, new AirportInfoRecord(tag, description, dataType, encryption, maxSize));





		//	Modem timeout, in seconds:

		maxSize = 4;
		dataType = AirportInfoRecord.UNSIGNED_INTEGER;
		encryption = AirportInfoRecord.UNENCRYPTED;
		description = "Modem timeout";
		tag = "moID";
		this.put(tag, new AirportInfoRecord(tag, description, dataType, encryption, maxSize));




		//	Dialing type:
		//		 	00 = tone
		//			01 = pulse

		maxSize = 1;
		dataType = AirportInfoRecord.BYTE;
		encryption = AirportInfoRecord.UNENCRYPTED;
		description = "Dialing type (tone or pulse)";
		tag = "moPD";
		this.put(tag, new AirportInfoRecord(tag, description, dataType, encryption, maxSize));





		//	Dialing type:
		//		00 = auto dial off
		//		01 = auto dial on

		maxSize = 1;
		dataType = AirportInfoRecord.BYTE;
		encryption = AirportInfoRecord.UNENCRYPTED;
		description = "Automatic dial";
		tag = "moAD";
		this.put(tag, new AirportInfoRecord(tag, description, dataType, encryption, maxSize));




		//	RTS Threshold: not present
		// 		max value 2347
		//





		//	Phone country code:
		//
		//		US standard = 	32 32 = 22 decimal
		//		Singapore = 	34 37
		//		Switzerland = 	31 35


		maxSize = 4;
		dataType = AirportInfoRecord.UNSIGNED_INTEGER;
		encryption = AirportInfoRecord.UNENCRYPTED;
		description = "Phone country code";
		tag = "moCC";
		this.put(tag, new AirportInfoRecord(tag, description, dataType, encryption, maxSize));


		//	Modem country code combo box index

		maxSize = 4;
		dataType = AirportInfoRecord.UNSIGNED_INTEGER;
		encryption = AirportInfoRecord.UNENCRYPTED;
		description = "Modem country code combo box index";
		tag = "moCI";
		this.put(tag, new AirportInfoRecord(tag, description, dataType, encryption, maxSize));





		//	Network name:

		maxSize = 32;
		dataType = AirportInfoRecord.CHAR_STRING;
		encryption = AirportInfoRecord.ENCRYPTED;
		description = "Network name";
		tag = "raNm";
		this.put(tag, new AirportInfoRecord(tag, description, dataType, encryption, maxSize));






		//
		//	Modem stuff:
		//

		maxSize = 32;
		dataType = AirportInfoRecord.CHAR_STRING;
		encryption = AirportInfoRecord.ENCRYPTED;
		description = "Primary phone number";
		tag = "moPN";
		this.put(tag, new AirportInfoRecord(tag, description, dataType, encryption, maxSize));



		maxSize = 32;
		dataType = AirportInfoRecord.CHAR_STRING;
		encryption = AirportInfoRecord.ENCRYPTED;
		description = "Secondary phone number";
		tag = "moAP";
		this.put(tag, new AirportInfoRecord(tag, description, dataType, encryption, maxSize));





		//
		//	PPPoE idle timeout, in seconds:
		//		0 = don't disconnect
		//

		maxSize = 4;
		dataType = AirportInfoRecord.UNSIGNED_INTEGER;
		encryption = AirportInfoRecord.UNENCRYPTED;
		description = "PPPoE idle timeout";
		tag = "peID";
		this.put(tag, new AirportInfoRecord(tag, description, dataType, encryption, maxSize));




		//	PPPoE auto connect:
		//		00 = off
		//		01 = on

		maxSize = 1;
		dataType = AirportInfoRecord.BYTE;
		encryption = AirportInfoRecord.UNENCRYPTED;
		description = "PPPoE auto connect";
		tag = "peAC";
		this.put(tag, new AirportInfoRecord(tag, description, dataType, encryption, maxSize));



		//	PPPoE stay connected:
		//		00 = no
		//		01 = yes


		maxSize = 1;
		dataType = AirportInfoRecord.BYTE;
		encryption = AirportInfoRecord.UNENCRYPTED;
		description = "PPPoE stay connected";
		tag = "peSC";
		this.put(tag, new AirportInfoRecord(tag, description, dataType, encryption, maxSize));






		// 	Encryption flag field:
		//			00 = no encryption
		//			01 = 40-bit
		//			02 = 128-bit


		maxSize = 4;
		dataType = AirportInfoRecord.BYTE_STRING;
		encryption = AirportInfoRecord.UNENCRYPTED;
		description = "Encryption switch";
		tag = "raWM";
		this.put(tag, new AirportInfoRecord(tag, description, dataType, encryption, maxSize));



		//	Encryption key:


		maxSize = 13;
		dataType = AirportInfoRecord.BYTE_STRING;
		encryption = AirportInfoRecord.ENCRYPTED;
		description = "Encryption key";
		tag = "raWE";
		this.put(tag, new AirportInfoRecord(tag, description, dataType, encryption, maxSize));




		//	Private LAN base station address and subnet mask:


		maxSize = 4;
		dataType = AirportInfoRecord.IP_ADDRESS;
		encryption = AirportInfoRecord.ENCRYPTED;
		description = "Private LAN base station address";
		tag = "laIP";
		this.put(tag, new AirportInfoRecord(tag, description, dataType, encryption, maxSize));

		maxSize = 4;
		dataType = AirportInfoRecord.IP_ADDRESS;
		encryption = AirportInfoRecord.ENCRYPTED;
		description = "Private LAN subnet mask";
		tag = "laSM";
		this.put(tag, new AirportInfoRecord(tag, description, dataType, encryption, maxSize));




		//	syslog host facility(0 - 8): omitted
		//





		//	Bridging switch:
		//		00 = don't bridge
		//		01 = bridge


		maxSize = 1;
		dataType = AirportInfoRecord.BYTE;
		encryption = AirportInfoRecord.UNENCRYPTED;
		description = "Wireless to Ethernet bridging switch";
		tag = "raWB";
		this.put(tag, new AirportInfoRecord(tag, description, dataType, encryption, maxSize));





		//	Access control switch:
		//		00 = no access control
		//		01 = access control used


		maxSize = 1;
		dataType = AirportInfoRecord.BYTE;
		encryption = AirportInfoRecord.UNENCRYPTED;
		description = "Access control switch";
		tag = "acEn";
		this.put(tag, new AirportInfoRecord(tag, description, dataType, encryption, maxSize));


		//	Access control info:


		maxSize = 16;
		dataType = AirportInfoRecord.BYTE_STRING;
		encryption = AirportInfoRecord.ENCRYPTED;
		description = "Access control info";
		tag = "acTa";
		this.put(tag, new AirportInfoRecord(tag, description, dataType, encryption, maxSize));




		//	DHCP service on wireless:
		//		00 = no DHCP service
		//		01 = DHCP on, using specified range of IP addresses


		maxSize = 10;
		dataType = AirportInfoRecord.BYTE;
		encryption = AirportInfoRecord.ENCRYPTED;
		description = "Wireless DHCP switch";
		tag = "raDS";
		this.put(tag, new AirportInfoRecord(tag, description, dataType, encryption, maxSize));



		//	DHCP service on LAN Ethernet:
		//		00 = no DHCP service
		//		01 = DHCP on


		maxSize = 1;
		dataType = AirportInfoRecord.BYTE;
		encryption = AirportInfoRecord.UNENCRYPTED;
		description = "LAN Ethernet DHCP switch";
		tag = "laDS";
		this.put(tag, new AirportInfoRecord(tag, description, dataType, encryption, maxSize));



		//	DHCP service on WAN Ethernet:
		//		00 = no DHCP service
		//		01 = DHCP on


		maxSize = 1;
		dataType = AirportInfoRecord.BYTE;
		encryption = AirportInfoRecord.ENCRYPTED;
		description = "WAN Ethernet DHCP switch";
		tag = "waDS";
		this.put(tag, new AirportInfoRecord(tag, description, dataType, encryption, maxSize));





		//	NAT switch:
		//		00 = NAT off
		//		01 = NAT on


		maxSize = 1;
		dataType = AirportInfoRecord.BYTE;
		encryption = AirportInfoRecord.UNENCRYPTED;
		description = "NAT switch";
		tag = "raNA";
		this.put(tag, new AirportInfoRecord(tag, description, dataType, encryption, maxSize));






		//	Watchdog reboot timer switch: omit





		//	Base station IP address: 0x46A


		maxSize = 4;
		dataType = AirportInfoRecord.IP_ADDRESS;
		encryption = AirportInfoRecord.ENCRYPTED;
		description = "Base station IP address";
		tag = "waIP";
		this.put(tag, new AirportInfoRecord(tag, description, dataType, encryption, maxSize));



		//	Default TTL, for use with NAT(?): omitted





		//	Router IP address and mask: 0x470, 0x474


		maxSize = 4;
		dataType = AirportInfoRecord.IP_ADDRESS;
		encryption = AirportInfoRecord.ENCRYPTED;
		description = "Router IP address";
		tag = "waRA";
		this.put(tag, new AirportInfoRecord(tag, description, dataType, encryption, maxSize));


		maxSize = 4;
		dataType = AirportInfoRecord.IP_ADDRESS;
		encryption = AirportInfoRecord.ENCRYPTED;
		description = "Subnet mask";
		tag = "waSM";
		this.put(tag, new AirportInfoRecord(tag, description, dataType, encryption, maxSize));



		//	0x0478:  syslog IP address
		//	0x047C:  trap host IP address
		//




		//	Names of base station, contact person


		maxSize = 32;
		dataType = AirportInfoRecord.CHAR_STRING;
		encryption = AirportInfoRecord.ENCRYPTED;
		description = "Contact person name";
		tag = "syCt";
		this.put(tag, new AirportInfoRecord(tag, description, dataType, encryption, maxSize));


		maxSize = 32;
		dataType = AirportInfoRecord.CHAR_STRING;
		encryption = AirportInfoRecord.ENCRYPTED;
		description = "Base station name";
		tag = "syNm";
		this.put(tag, new AirportInfoRecord(tag, description, dataType, encryption, maxSize));



		//	Base station location:


		maxSize = 32;
		dataType = AirportInfoRecord.CHAR_STRING;
		encryption = AirportInfoRecord.ENCRYPTED;
		description = "Base station location";
		tag = "syLo";
		this.put(tag, new AirportInfoRecord(tag, description, dataType, encryption, maxSize));







		//	DHCP client ID:


		maxSize = 32;	// guess
		dataType = AirportInfoRecord.CHAR_STRING;
		encryption = AirportInfoRecord.ENCRYPTED;
		description = "DHCP client ID";
		tag = "waDC";
		this.put(tag, new AirportInfoRecord(tag, description, dataType, encryption, maxSize));






		//	DHCP address range to serve:
		//		starting address: 0xCF2
		//		ending address: 0xCF6


		maxSize = 4;
		dataType = AirportInfoRecord.IP_ADDRESS;
		encryption = AirportInfoRecord.ENCRYPTED;
		description = "DHCP address range start";
		tag = "dhBg";
		this.put(tag, new AirportInfoRecord(tag, description, dataType, encryption, maxSize));


		maxSize = 4;
		dataType = AirportInfoRecord.IP_ADDRESS;
		encryption = AirportInfoRecord.ENCRYPTED;
		description = "DHCP address range end";
		tag = "dhEn";
		this.put(tag, new AirportInfoRecord(tag, description, dataType, encryption, maxSize));




		//	DNS servers:


		maxSize = 4;
		dataType = AirportInfoRecord.IP_ADDRESS;
		encryption = AirportInfoRecord.ENCRYPTED;
		description = "Primary DNS server";
		tag = "waD1";
		this.put(tag, new AirportInfoRecord(tag, description, dataType, encryption, maxSize));


		maxSize = 4;
		dataType = AirportInfoRecord.IP_ADDRESS;
		encryption = AirportInfoRecord.ENCRYPTED;
		description = "Secondary DNS server";
		tag = "waD2";
		this.put(tag, new AirportInfoRecord(tag, description, dataType, encryption, maxSize));



		//	DHCP lease time:
		//		4-byte unsigned integer giving lease time in seconds


		maxSize = 4;
		dataType = AirportInfoRecord.UNSIGNED_INTEGER;
		encryption = AirportInfoRecord.ENCRYPTED;
		description = "DHCP lease time";
		tag = "dhLe";
		this.put(tag, new AirportInfoRecord(tag, description, dataType, encryption, maxSize));



		//	Domain name (from DNS setting window): 0xD0A


		maxSize = 32;
		dataType = AirportInfoRecord.CHAR_STRING;
		encryption = AirportInfoRecord.ENCRYPTED;
		description = "Domain name";
		tag = "waDN";
		this.put(tag, new AirportInfoRecord(tag, description, dataType, encryption, maxSize));






		//	Port mapping functions:


		maxSize = 16;
		dataType = AirportInfoRecord.BYTE_STRING;
		encryption = AirportInfoRecord.ENCRYPTED;
		description = "Port mapping";
		tag = "pmTa";
		this.put(tag, new AirportInfoRecord(tag, description, dataType, encryption, maxSize));








		//	Username@domain, password



		maxSize = 64;	// guess
		dataType = AirportInfoRecord.CHAR_STRING;
		encryption = AirportInfoRecord.ENCRYPTED;
		description = "Dial-up username";
		tag = "moUN";
		this.put(tag, new AirportInfoRecord(tag, description, dataType, encryption, maxSize));

		maxSize = 64;	// guess
		dataType = AirportInfoRecord.CHAR_STRING;
		encryption = AirportInfoRecord.ENCRYPTED;
		description = "Dial-up password";
		tag = "moPW";
		this.put(tag, new AirportInfoRecord(tag, description, dataType, encryption, maxSize));

		maxSize = 64;	// guess
		dataType = AirportInfoRecord.CHAR_STRING;
		encryption = AirportInfoRecord.ENCRYPTED;
		description = "PPPoE username";
		tag = "peUN";
		this.put(tag, new AirportInfoRecord(tag, description, dataType, encryption, maxSize));

		maxSize = 64;	// guess
		dataType = AirportInfoRecord.CHAR_STRING;
		encryption = AirportInfoRecord.ENCRYPTED;
		description = "PPPoE password";
		tag = "pePW";
		this.put(tag, new AirportInfoRecord(tag, description, dataType, encryption, maxSize));




		//	PPPoE Service Name


		maxSize = 64;	// guess!
		dataType = AirportInfoRecord.CHAR_STRING;
		encryption = AirportInfoRecord.ENCRYPTED;
		description = "PPPoE service name";
		tag = "peSN";
		this.put(tag, new AirportInfoRecord(tag, description, dataType, encryption, maxSize));



		//	Reboot signal


		maxSize = 0;
		dataType = AirportInfoRecord.BYTE;
		encryption = AirportInfoRecord.UNENCRYPTED;
		description = "Reboot flag";
		tag = "acRB";
		this.put(tag, new AirportInfoRecord(tag, description, dataType, encryption, maxSize));
  }

  getUpdateBytes() {
    let arr = [];
    this.forEach((nextElement) => {
      arr = arr.concat(nextElement.getUpdateBytes());
    });

		return arr;
	}

  getRequestBytes () {
    let arr = [];
    this.forEach((nextElement) => {
      arr = arr.concat(nextElement.getRequestBytes());
    });

    return arr;
  }

  toString () {
		let returnText = '';

    this.forEach((nextElement) => {
      returnText += nextElement.toString();
			returnText += "\n";
    });

		return returnText;
	}

  toJSON () {
		let returnObj = {};

    this.forEach((nextElement) => {
      returnObj[nextElement.tag] = nextElement;
    });

		return returnObj;
	}

  getIntegerValue (valueBytes) {
		// let value = 0;
    //
		// for (let i = 0; i < valueBytes.length; i++) {
		// 	let absValue = valueBytes[i];
    //
		// 	if (absValue < 0) {
    //     absValue += 256;
    //   }
    //
		// 	value = (value * 256) + absValue;
		// }

		return utils.byteArrayToInteger(valueBytes);
	}

  // Alias for compability.
  // @TODO: Figure out how to 🔥 this.
  put (key, val) {
    return this.set(key, val);
  }
}

AirportInfo.MAX_NUM_MAC_ADDRESSES = MAX_NUM_MAC_ADDRESSES;
AirportInfo.MAX_NUM_PORT_MAPS = MAX_NUM_PORT_MAPS;
AirportInfo.MAX_NUM_SNMP_ACCESS_ENTRIES = MAX_NUM_SNMP_ACCESS_ENTRIES;
AirportInfo.MAX_NUM_LOGIN_CHARS = MAX_NUM_LOGIN_CHARS;

module.exports = AirportInfo;
