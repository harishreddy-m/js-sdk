/* eslint-disable no-bitwise,default-case,no-fallthrough */

'use strict';

const atob = require('../util/atob').atob;

/**
 * A Bloom Filter is a client-side kept cache sketch of the server cache
 *
 * @alias caching.BloomFilter
 */
class BloomFilter {
  /**
   * @param {Object} bloomFilter The raw Bloom filter.
   * @param {number} bloomFilter.m The raw Bloom filter bits.
   * @param {number} bloomFilter.h The raw Bloom filter hashes.
   * @param {string} bloomFilter.b The Base64-encoded raw Bloom filter bytes.
   */
  constructor(bloomFilter) {
    /**
     * The raw bytes of this Bloom filter.
     * @type string
     * @readonly
     */
    this.bytes = atob(bloomFilter.b);

    /**
     * The amount of bits.
     * @type number
     * @readonly
     */
    this.bits = bloomFilter.m;

    /**
     * The amount of hashes.
     * @type number
     * @readonly
     */
    this.hashes = bloomFilter.h;

    /**
     * The creation timestamp of this bloom filter.
     * @type number
     * @readonly
     */
    this.creation = Date.now();
  }

  /**
   * Returns whether this Bloom filter contains the given element.
   *
   * @param {string} element The element to check if it is contained.
   * @return {boolean} True, if the element is contained in this Bloom filter.
   */
  contains(element) {
    const hashes = BloomFilter.getHashes(element, this.bits, this.hashes);
    for (let i = 0, len = hashes.length; i < len; i += 1) {
      if (!this.isSet(hashes[i])) {
        return false;
      }
    }
    return true;
  }

  /**
   * Checks whether a bit is set at a given position.
   *
   * @param {number} index The position index to check.
   * @return {boolean} True, if the bit is set at the given position.
   * @private
   */
  isSet(index) {
    const pos = Math.floor(index / 8);
    const bit = 1 << (index % 8);
    // Extract byte as int or NaN if out of range
    const byte = this.bytes.charCodeAt(pos);
    // Bit-wise AND should be non-zero (NaN always yields false)
    return (byte & bit) !== 0;
  }

  /**
   * Returns the hases of a given element in the Bloom filter.
   *
   * @param {string} element The element to check.
   * @param {number} bits The amount of bits.
   * @param {number} hashes The amount of hashes.
   * @return {number[]} The hashes of an element in the Bloom filter.
   * @private
   */
  static getHashes(element, bits, hashes) {
    const hashValues = new Array(this.hashes);
    const hash1 = BloomFilter.murmur3(0, element);
    const hash2 = BloomFilter.murmur3(hash1, element);
    for (let i = 0; i < hashes; i += 1) {
      hashValues[i] = (hash1 + (i * hash2)) % bits;
    }
    return hashValues;
  }

  /**
   * Calculate a Murmur3 hash.
   *
   * @param {number} seed A seed to use for the hashing.
   * @param {string} key A key to check.
   * @return {number} A hashed value of key.
   * @private
   */
  static murmur3(seed, key) {
    const remainder = key.length & 3;
    const bytes = key.length - remainder;
    const c1 = 0xcc9e2d51;
    const c2 = 0x1b873593;
    let h1;
    let h1b;
    let k1;
    let i;
    h1 = seed;
    i = 0;

    while (i < bytes) {
      k1 =
          ((key.charCodeAt(i) & 0xff)) |
          ((key.charCodeAt(i += 1) & 0xff) << 8) |
          ((key.charCodeAt(i += 1) & 0xff) << 16) |
          ((key.charCodeAt(i += 1) & 0xff) << 24);
      i += 1;

      k1 = ((((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16))) & 0xffffffff;
      k1 = (k1 << 15) | (k1 >>> 17);
      k1 = ((((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16))) & 0xffffffff;

      h1 ^= k1;
      h1 = (h1 << 13) | (h1 >>> 19);
      h1b = ((((h1 & 0xffff) * 5) + ((((h1 >>> 16) * 5) & 0xffff) << 16))) & 0xffffffff;
      h1 = (((h1b & 0xffff) + 0x6b64) + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16));
    }

    k1 = 0;

    switch (remainder) {
      case 3:
        k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
      case 2:
        k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
      case 1:
        k1 ^= (key.charCodeAt(i) & 0xff);

        k1 = (((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
        k1 = (k1 << 15) | (k1 >>> 17);
        k1 = (((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
        h1 ^= k1;
    }

    h1 ^= key.length;

    h1 ^= h1 >>> 16;
    h1 = (((h1 & 0xffff) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
    h1 ^= h1 >>> 13;
    h1 = ((((h1 & 0xffff) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16))) & 0xffffffff;
    h1 ^= h1 >>> 16;

    return h1 >>> 0;
  }
}

module.exports = BloomFilter;
