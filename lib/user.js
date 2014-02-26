var auth = require('./auth');

var userProto = {
  toJSON: function () {
    return {
      uuid: this.uuid,
      digest: this.digest,
      verified: this.verified,
      role: this.role
    };
  }
};

var userObj = function (opts) {
  opts || (opts = {});
  return Object.create(userProto, {
    uuid: { value: opts.uuid },
    digest: { value: opts.digest },
    verified: { value: auth.verify(opts.digest, opts.uuid) },
    role: { value: 'presenter', writable: true }
  });
};

var user = {
  create: function () {
    var uuid = auth.createUuid();
    return this.enhance({
      uuid: uuid,
      digest: auth.createDigest(uuid)
    });
  },
  enhance: userObj,
  actives: {},
  super: null
};

exports = module.exports = user;
