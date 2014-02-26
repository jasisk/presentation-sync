var user = require('./user');
var idx = 0;

exports = module.exports = {
  associate: function (id, uuid, digest) {
    var current = user.enhance({uuid: uuid, digest: digest});
    this.connections[id].write(JSON.stringify({
      action: 'goto',
      args: [idx]
    }));
    if (current.verified) {
      user.actives[id] = current;
      return;
    }
    return;
  },
  upgrade: function (id, key) {
    if (key === 'Upgrade Me!') {
      user.super = id;
    }
  },
  send: function (id, action, args) {
    if (id !== user.super) {
      return;
    }
    if (action === 'goto') {
      idx = args[0];
    }
    var conns = this.connections;
    Object.keys(conns).forEach(function (name) {
      var conn = conns[name];
      if (conn.id === id) { return; }
      conn.write(JSON.stringify({
        action: action,
        args: args
      }));
    });
  }
};
