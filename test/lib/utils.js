const utils = require('../../lib/utils'),
      expect = require('chai').expect;

describe('utils', function () {
  describe('#toByteArray()', function () {

    it('should be a function', function () {
      expect(utils.toByteArray).to.exist;
      expect(utils.toByteArray).to.be.a('function');
    });

    it('should convert string to byte array', function () {
      expect(utils.toByteArray('a')).to.be.eql(['a'.charCodeAt(0)]);
    });

    it('should convert number to byte array', function () {
      expect(utils.toByteArray(1234)).to.be.eql([
        0,
        0,
        4,
        210
      ]);
    });

    it('should convert number to byte array with given size', function () {
      expect(utils.toByteArray(1234, 2)).to.be.eql([
        4,
        210
      ]);
    });
  });

  describe('#stringToBytes()', function () {

    it('should be a function', function () {
      expect(utils.stringToBytes).to.exist;
      expect(utils.stringToBytes).to.be.a('function');
    });

    it('should return an array', function () {
      expect(utils.stringToBytes('a')).to.be.an('array');
    });

    it('should convert string to its char codes', function () {
      expect(utils.stringToBytes('a')).to.be.eql(['a'.charCodeAt(0)]);
    });
  });

  describe('#byteArrayToString()', function () {

    it('should be a function', function () {
      expect(utils.byteArrayToString).to.exist;
      expect(utils.byteArrayToString).to.be.a('function');
    });

    it('should return a string', function () {
      expect(utils.byteArrayToString([97])).to.be.a('string');
    });

    it('should correctly convert to array to string', function () {
      expect(utils.byteArrayToString([97])).to.be.equal('a');
    });
  });

  describe('#byteArrayToInteger()', function () {

    it('should be a function', function () {
      expect(utils.byteArrayToInteger).to.exist;
      expect(utils.byteArrayToInteger).to.be.a('function');
    });

    it('should return a number', function () {
      expect(utils.byteArrayToInteger([0, 0, 4, 210])).to.be.a('number');
    });

    it('should correctly convert byte array to integer', function () {
      expect(utils.byteArrayToInteger([0, 0, 4, 210])).to.be.equal(1234);
    });
  });

  describe('#bufferToArray()', function () {

    it('should be a function', function () {
      expect(utils.bufferToArray).to.exist;
      expect(utils.bufferToArray).to.be.a('function');
    });

    it('should return an array', function () {
      expect(utils.bufferToArray(new Buffer([]))).to.be.an('array');
    });

    it('should fill array with zeroes by default', function () {
      expect(utils.bufferToArray(new Buffer([null, null]))).to.be.eql([0, 0]);
    });

    it('should copy the values', function () {
      expect(utils.bufferToArray(new Buffer([1, null, 2]))).to.be.eql([1, 0, 2]);
    });
  });
});
