'use strict';

let utils = require('../utils');

const CHAR_STRING = 0,
      IP_ADDRESS = 1,
      BYTE_STRING = 2,
      PHONE_NUMBER = 3,
      UNSIGNED_INTEGER = 4,
      BYTE = 5,
      LITTLE_ENDIAN_UNSIGNED_INTEGER = 6,
      UNENCRYPTED = 0,
      ENCRYPTED = 2;

const CIPHER = [
  0x0e, 0x39, 0xf8, 0x05, 0xc4, 0x01, 0x55, 0x4f, 0x0c, 0xac, 0x85, 0x7d, 0x86, 0x8a, 0xb5, 0x17,
	0x3e, 0x09, 0xc8, 0x35, 0xf4, 0x31, 0x65, 0x7f, 0x3c, 0x9c, 0xb5, 0x6d, 0x96, 0x9a, 0xa5, 0x07,
	0x2e, 0x19, 0xd8, 0x25, 0xe4, 0x21, 0x75, 0x6f, 0x2c, 0x8c, 0xa5, 0x9d, 0x66, 0x6a, 0x55, 0xf7,
	0xde, 0xe9, 0x28, 0xd5, 0x14, 0xd1, 0x85, 0x9f, 0xdc, 0x7c, 0x55, 0x8d, 0x76, 0x7a, 0x45, 0xe7,
	0xce, 0xf9, 0x38, 0xc5, 0x04, 0xc1, 0x95, 0x8f, 0xcc, 0x6c, 0x45, 0xbd, 0x46, 0x4a, 0x75, 0xd7,
	0xfe, 0xc9, 0x08, 0xf5, 0x34, 0xf1, 0xa5, 0xbf, 0xfc, 0x5c, 0x75, 0xad, 0x56, 0x5a, 0x65, 0xc7,
	0xee, 0xd9, 0x18, 0xe5, 0x24, 0xe1, 0xb5, 0xaf, 0xec, 0x4c, 0x65, 0xdd, 0x26, 0x2a, 0x15, 0xb7,
	0x9e, 0xa9, 0x68, 0x95, 0x54, 0x91, 0xc5, 0xdf, 0x9c, 0x3c, 0x15, 0xcd, 0x36, 0x3a, 0x05, 0xa7,
	0x8e, 0xb9, 0x78, 0x85, 0x44, 0x81, 0xd5, 0xcf, 0x8c, 0x2c, 0x05, 0xfd, 0x06, 0x0a, 0x35, 0x97,
	0xbe, 0x89, 0x48, 0xb5, 0x74, 0xb1, 0xe5, 0xff, 0xbc, 0x1c, 0x35, 0xed, 0x16, 0x1a, 0x25, 0x87,
	0xae, 0x99, 0x58, 0xa5, 0x64, 0xa1, 0xf5, 0xef, 0xac, 0x0c, 0x25, 0x1d, 0xe6, 0xea, 0xd5, 0x77,
	0x5e, 0x69, 0xa8, 0x55, 0x94, 0x51, 0x05, 0x1f, 0x5c, 0xfc, 0xd5, 0x0d, 0xf6, 0xfa, 0xc5, 0x67,
	0x4e, 0x79, 0xb8, 0x45, 0x84, 0x41, 0x15, 0x0f, 0x4c, 0xec, 0xc5, 0x3d, 0xc6, 0xca, 0xf5, 0x57,
	0x7e, 0x49, 0x88, 0x75, 0xb4, 0x71, 0x25, 0x3f, 0x7c, 0xdc, 0xf5, 0x2d, 0xd6, 0xda, 0xe5, 0x47,
	0x6e, 0x59, 0x98, 0x65, 0xa4, 0x61, 0x35, 0x2f, 0x6c, 0xcc, 0xe5, 0x5d, 0xa6, 0xaa, 0x95, 0x37,
	0x1e, 0x29, 0xe8, 0x15, 0xd4, 0x11, 0x45, 0x5f, 0x1c, 0xbc, 0x95, 0x4d, 0xb6, 0xba, 0x85, 0x27
];


class AirportInfo {
  constructor (tag, description, dataType, encryption, maxLength, value) {
    this.tag = tag || '';
  	this.description = description || '';
  	this.dataType = dataType || CHAR_STRING;
  	this.encryption = encryption || UNENCRYPTED;
  	this.maxLength = maxLength || 0;

    if (!value && !this.maxLength) {
      this.value = new Array(0);
    } else if (!value && this.maxLength) {
      this.value = new Array(this.maxLength);
    } else {
      this.value = value;
    }
  }

  // @TODO Figure this out.
  convertToUnsignedInteger (bytes) {
    return bytes.join('');
  }

  convertToIPAddress (bytes) {
		let returnString = '',
        value = 0;

		for (let i = 0; i < bytes.length - 1; i++) {
			value = bytes[i];
			if (value < 0) {
        value += 256;
      }
			returnString += value + ".";
		}

		value = bytes[bytes.length - 1];
		if (value < 0) {
      value += 256;
    }

		returnString += value;

		return returnString;
	}

  getValue() {
		return this.value;
	}

  setValue (bytes) {
    // just set value array
    this.value = bytes;
  }

  getUpdateBytes() {
		let buf = [];

		buf = buf.concat(utils.toByteArray(this.tag));
		buf = buf.concat(utils.toByteArray(this.encryption ? 1 : 0));
		buf = buf.concat(utils.toByteArray(this.value.length));

		if (this.value.length > 0) {
			// encrypt bytes if needed
			if (this.encryption == ENCRYPTED) {
				buf = buf.concat(this.encryptBytes(CIPHER, this.value));
			} else {
				buf = buf.concat(this.value);
			}
		}

		return buf;
	}

  getRequestBytes () {
    let buf = [];

		buf = buf.concat(utils.toByteArray(this.tag));
		buf = buf.concat(utils.toByteArray(this.encryption ? 1 : 0));
		buf = buf.concat(utils.toByteArray(0));

		return buf;
	}

  decryptBytes (cipherString, encryptedString) {
		let returnBytes = new Array(encryptedString.length);

		// just xor each byte in encryptedString with cipherString
		let length = encryptedString.length;

		for (let i = 0; i < length; i++) {
			returnBytes[i] = encryptedString[i] ^ cipherString[i % 256];
		}

		return returnBytes;
	}

  encryptBytes (cipherString, encryptedString) {
		return this.decryptBytes(cipherString, encryptedString);
	}

  getIntegerValue (valueBytes) {
		let value = 0;

		for (let i = 0; i < valueBytes.length; i++) {
			let absValue = valueBytes[i];

			if (absValue < 0) {
        absValue += 256;
      }

			value = value * 256 + absValue;
		}

		return value;
	}

  hexByte (b) {
		let pos = b;

		if (pos < 0) {
      pos += 256;
    }

		let returnString = '';
		returnString += (pos / 16).toString(16);
		returnString += (pos % 16).toString(16);
		return returnString;
	}



	hexBytes (bytes) {
		let returnString = '';

		for (let i = 0; i < bytes.length; i++) {
			returnString += this.hexByte(bytes[i]);
		}

		return returnString;
	}

  setBytesFromString (valueString) {
    let bytes = [];

    switch (dataType) {

      case UNSIGNED_INTEGER:
        bytes = this.convertFromUnsignedInteger(valueString);
        break;
      case LITTLE_ENDIAN_UNSIGNED_INTEGER:
        bytes = this.convertFromUnsignedInteger(valueString);
        bytes = this.reverseBytes(bytes);
        break;
      case CHAR_STRING:
      case PHONE_NUMBER:
        if (valueString.length > this.maxLength - 1) {
          // System.out.println("Value format exception at " + OIDNum + " " + OIDRow + " " + OIDCol);
          throw new Error("Maximum " + (this.maxLength - 1) + " characters.");
        } else {
          // Convert string to bytes.
          for (var i = 0; i < valueString.length; ++i) {
              bytes.push(valueString.charCodeAt(i));
          }
        }

        break;
      case IP_ADDRESS:
        bytes = this.convertFromIPv4Address(valueString);
        break;
      case BYTE:
      case BYTE_STRING:
      default:
        bytes = this.convertFromHexString(valueString);
        break;
    }

    this.value = bytes;
  }

  convertFromIPv4Address (addressString) {
		// might be partial address
		let bytes = new Buffer(this.maxLength),
        i = 0,
        value = 0,
        st = addressString.split('.');

		if (st.length !== maxLength) {
			if (st.length === 4) {
				throw new Error("Bad IP address: must be of form a.b.c.d, with a,b,c and d between 0 and 255.");
			} else {
				throw new Error("Bad dotted address supplied: should have " + maxLength + " components.");
      }
		}

    for (let component in st) {
      try {
        let value = parseInt(component);
        if ((value < 0) || (value > 255)) {
          throw new Error("Bad IP address: must be of form a.b.c.d, with a,b,c and d between 0 and 255.");
        } else {
          bytes[i] = value;
          i++;
        }
      } catch (e) {
        throw new Error("Bad IP address: must be of form a.b.c.d, with a,b,c and d between 0 and 255.");
      }
    }

		return bytes;
	}

  convertFromUnsignedInteger (valueString) {
		let length = this.maxLength,
        bytes = new Buffer(length);

		try {
			let minValue = 0,
          maxValue = 1;

			for (let i = 0; i < length; i++) {
				maxValue *= 256;
			}

			maxValue -= 1;

			let value = parseFloat(valueString);

			if ((value < minValue) || (value > maxValue))
				 throw new Error("Value must be between " + minValue + " and " + maxValue + ".");

			for (let i = 0; i < length; i++) {
				bytes[length - i - 1] = value % 256;
				value = value / 256;
			}
		} catch (e) {
			throw new Error("Bad number format.");
		}

		return bytes;
	}

  convertFromHexString (hexString) {
		let bytes = new Buffer(this.maxLength),
        index = 0;

		// eliminate spaces in string
		hexString.trim();
		while((index = hexString.indexOf(' ')) !== -1) {
			hexString = hexString.substring(0, index) + hexString.substring(index + 1);
		}

		// make sure have even number of hex digits
		if (2 * (hexString.length / 2) !== hexString.length) {
      throw new Error("Must have an even number of hexadecimal digits.");
    }

		// make sure don't have wrong number of bytes
		if ((this.maxLength > 0) && (hexString.length / 2 !== this.maxLength)) {
      throw new Error("Too many hexadecimal digits (must have " + 2 * this.maxLength + " hex digits).");
    }

		for (let i = 0; i < (hexString.length/2); i++) {
			// get next pair of digits
			let digitString = hexString.substring(2 * i, 2 * i + 2);

			try {
				bytes[i] = parseInt(digitString, 16);
			} catch (e) {
				throw new Error("Entries must be hexadecimal digits (0 through 9 and a through f or A through F) or spaces.");
			}
		}

		return bytes;
	}

  reverseBytes (inBytes) {
    let length = inBytes.length,
        outBytes = new Buffer(length);

    for (let i = 0; i < length; i++) {
      outBytes[i] = inBytes[length - i - 1];
    }

    return outBytes;
  }

  toString () {
    let returnString = '',
        bytes = this.value;

		switch (this.dataType) {
			case UNSIGNED_INTEGER:
				try {
					returnString = this.convertToUnsignedInteger(bytes);
				} catch (e) {
					returnString = this.hexBytes(bytes);
				}
				break;
			case LITTLE_ENDIAN_UNSIGNED_INTEGER:
				try {
					bytes = this.reverseBytes(bytes);

					returnString = this.convertToUnsignedInteger(bytes);
				} catch (e) {
					returnString = this.hexBytes(bytes);
				}
				break;
			case CHAR_STRING:
			case PHONE_NUMBER:
				returnString = bytes.toString();
				break;
			case IP_ADDRESS:
				returnString = this.convertToIPAddress(bytes);
				break;
			case BYTE:
			case BYTE_STRING:
			default:
				returnString = this.hexBytes(bytes);
				break;
		}

		return returnString;
  }
}

AirportInfo.decryptBytes = function decryptBytes (cipherString, encryptedString) {
  let returnBytes = new Array(encryptedString.length);

  // just xor each byte in encryptedString with cipherString
  let length = encryptedString.length;

  for (let i = 0; i < length; i++) {
    returnBytes[i] = encryptedString[i] ^ cipherString[i % 256];
  }

  return returnBytes;
}

AirportInfo.encryptBytes = function encryptBytes (cipherString, encryptedString) {
  return AirportInfo.decryptBytes(cipherString, encryptedString);
}

AirportInfo.cipherBytes = CIPHER;
AirportInfo.UNENCRYPTED = UNENCRYPTED;
AirportInfo.ENCRYPTED = ENCRYPTED;
AirportInfo.CHAR_STRING = CHAR_STRING;
AirportInfo.IP_ADDRESS = IP_ADDRESS;
AirportInfo.BYTE_STRING = BYTE_STRING;
AirportInfo.PHONE_NUMBER = PHONE_NUMBER;
AirportInfo.UNSIGNED_INTEGER = UNSIGNED_INTEGER;
AirportInfo.BYTE = BYTE;
AirportInfo.LITTLE_ENDIAN_UNSIGNED_INTEGER = LITTLE_ENDIAN_UNSIGNED_INTEGER;

module.exports = AirportInfo;
