var crypto = require('crypto');
var key = process.env['PSYNC_KEY'] || 'th15iZmyK3y!';

var auth = {
  createUuid: function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16|0, v = c === 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  },
  comparison: function (expect, actual) {
    return expect === actual;
  },
  createDigest: function (uuid) {
    var hmac, digest;
    hmac = crypto.createHmac('sha1', key);
    hmac.update(uuid);
    digest = hmac.digest('hex');
    return digest;
  },
  verify: function (digest, uuid) {
    if (!uuid || !digest) { return false; }
    var actual = this.createDigest(uuid);
    return this.comparison(digest, actual);
  }
};

exports = module.exports = auth;