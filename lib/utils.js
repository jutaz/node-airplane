'use strict';
let _ = require('lodash');

module.exports.toByteArray = function toByteArray (item, size) {
  let arr = [];
  if (_.isString(item)) {
    return this.stringToBytes(item);
  }
  // Default to 4 bit size.
  size = size || 4;
  // Convert to Array of `size`.
  for (let i = 0; i < size; i++) {
    arr.push((item >> (8 * i)) & 0xFF);
  }
  return arr.reverse();
}

module.exports.stringToBytes = function stringToBytes (item) {
  return _.map(item.split(''), function (i) {
    return i.charCodeAt(0);
  });
}

module.exports.byteArrayToString = function byteArrayToString (array) {
  return _.map(array, function (i) {
    return String.fromCharCode(i)
  }).join('');
}

module.exports.byteArrayToInteger = function byteArrayToInteger (array) {
  let value = 0;
  for (let i = 0; i < array.length; i++) {
      value += (array[i] & 0x000000FF) << (array.length - 1 - i) * 8;
  }
  return value;
}

module.exports.bufferToArray = function bufferToArray (buffer) {
  let arr = _.fill(Array(buffer.length), 0x00);
  return _.map(arr, function (item, i) {
    return buffer[i] || item;
  });
}
