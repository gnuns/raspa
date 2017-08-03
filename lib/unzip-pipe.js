/*
 * Some websites compress the response multiple times (to avoid crawlers?)
 * this transform stream deflate the buffer recursively until it's not a gzip anymore
 */

const zlib = require('zlib');
const Transform = require('stream').Transform;
const util = require('util');

module.exports = Unzip;

function Unzip(options) {
  if (!(this instanceof Unzip)) {
    return new Unzip(options);
  }
  Transform.call(this, options);
  this.chunks = [];
}
util.inherits(Unzip, Transform);

Unzip.prototype._transform = function (chunk, enc, cb) {
  this.chunks.push(chunk);
  cb();
};
Unzip.prototype._flush = function (cb) {
  let buff = Buffer.concat(this.chunks);
  let uncompressed = gunzip(buff);
  this.push(uncompressed);
  cb();
};

function gunzip(buffer) {
  try {
    return gunzip(zlib.gunzipSync(buffer));
  } catch (e) {
    return buffer;
  }
}
