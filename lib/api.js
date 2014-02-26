var express = require('express');
var app = express();
var cls = require('continuation-local-storage');
var session = cls.getNamespace('psync');
var userObj = require('./user');

function provides(type) {
  return function (req, res, next) {
    if (req.accepts(type)) return next();
    next('route');
  }
}

var checkUser = session.bind(function (req, res, next) {
  var uuid = req.session.uuid;
  var digest = req.session.digest;
  if (uuid && digest) {
    var user = userObj.enhance({
      uuid: uuid,
      digest: digest
    });
    if (user.verified) {
      session.set('user', user);
    }
  }
  next();
});

var app = express();

app.use(express.json());
app.use(express.urlencoded());
app.use(express.cookieParser());
app.use(express.session({secret: 'omgomgomg!!!'}));
app.use(checkUser);

app.get('/user', provides('json'), function (req, res) {
  var user;
  if (!(user = session.get('user'))) {
    user = userObj.create();
    if (!Object.keys(userObj.actives).length) {
      user.role = 'presenter';
    }
    req.session.uuid = user.uuid;
    req.session.digest = user.digest;
  }
  res.json(user.toJSON());
});

exports = module.exports = {
  routes: app
}
