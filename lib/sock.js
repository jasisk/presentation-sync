var sockjs = require('sockjs');
var sock = sockjs.createServer({sockjs_url: "http://cdn.sockjs.org/sockjs-0.3.min.js"});
var http = require('http');

exports = module.exports = {
  install: function (app) {
    this.server = http.createServer(app);
    sock.installHandlers(this.server, {prefix: '/ws'});
  },
  instance: sock
};
