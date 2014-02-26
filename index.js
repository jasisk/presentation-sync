var express = require('express');
var cls = require('continuation-local-storage');
var session = cls.createNamespace('psync');
var sock = require('./lib/sock');
var api = require('./lib/api');
var actions = require('./lib/actions');
var user = require('./lib/user');
var activeConnections = {};

function activeIdx(id) {
  return activeConnections[id];
}

var app = express();

app.use('/api', api.routes);
app.get('/api/users', session.bind(function (req, res) {
  var strippedUsers = Object.keys(user.actives).map(function (id) {
    var guy = JSON.parse(JSON.stringify(user.actives[id]));
    delete guy.verified;
    delete guy.digest;
    delete guy.role;
    guy.sid = id;
    return guy;
  });
  res.json(strippedUsers);
}));
app.use(express.static(__dirname + '/static/stack'));

sock.install(app);

sock.instance.on('connection', function (conn) {
  var idx, id = conn.id;
  if (!activeIdx(id)) {
    activeConnections[id] = conn;
  }
  conn.on('data', function (message) {
    var meta = JSON.parse(message);
    var a = actions[meta.action];
    meta.args.unshift(id);
    var out = a.apply({
      connections: activeConnections
    }, meta.args);
    if (out !== undefined) {
      conn.write(JSON.stringify(out));
    }
  });
  conn.on('close', function () {
    if (activeIdx(id)) {
      delete activeConnections[id];
    }
    if (user.actives[id]) {
      delete user.actives[id];
    }
  });
});

sock.server.listen(3000);
