(function () {
  function initialize() {
    var mapOptions = {
      center: new google.maps.LatLng(42.3581, -71.0636),
      zoom: 14
    };
    var map = new google.maps.Map(document.getElementById("map"),
        mapOptions);
  }

  var sock;
  sock = window.sock = new SockJS('/ws');
  var presenterIdx = 0;
  var synced = true;
  var actions = {
    goto: function (state) {
      presenterIdx = state;
      if (synced) {
        stack.position(state);
      }
      var hash = +location.hash.slice(1);
      synced = hash === presenterIdx;
    }
  };
  function gotUser(r) {
    var role = r.role;
    var uuid = r.uuid;
    var digest = r.digest;
    sock.send(JSON.stringify({
      action: 'associate',
      args: [uuid, digest]
    }));
    function go() {
      setTimeout(initialize, 300);
      go = function () {};
    }
    d3.select(window).on('hashchange.stack', function () {
      var h = +location.hash.slice(1);
      if (h === 2) {
        go();
      }
      if (role === 'presenter') {
        sock.send(JSON.stringify({
          action: 'send',
          args: ['goto',[+location.hash.slice(1)]]
        }));
      }
      var hash = +location.hash.slice(1);
      synced = hash === presenterIdx;
   });
  }
  sock.onopen = function () {
    sock.onmessage = function (e) {
      var meta = JSON.parse(e.data);
      if (meta.action && actions[meta.action]) {
        actions[meta.action].apply(this, meta.args);
      }
    };
    $.getJSON('/api/user', gotUser);
  };
  sock.onclose = function () {
    sock.onmessage = function () {};
  };
}());
