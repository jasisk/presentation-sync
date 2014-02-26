(function () {

  function manager(role) {
    var roles = {
      'presenter': ['control', 'track', 'ask', 'viewAsks'],
      'participant': ['track', 'ask', 'viewAsks'],
      'viewer': ['track', 'viewAsks'],
      'unknown': ['track']
    };
    var permissions = roles[role] || roles['unknown'];
    return function (permission) {
      if (typeof permission === "string") {
        return !!~permissions.indexOf(permission);
      }
    };
  };

  var User = Backbone.Model.extend({
    defaults: {
      tracking: true,
      asking: false,
      role: null
    },
    setManager: function () {
      var role = this.get('role');
      this.can = manager(role);
    },
    initialize: function () {
      this.setManager();
      this.on('change:role', this.setManager);
    }
  });

  var Local = Backbone.Model.extend({
    defaults: {
      state: 0
    }
  });

  var Remote = Local.extend({
    defaults: {
      status: 'disconnected'
    }
  });

  var Question = Backbone.Model.extend({
    defaults: {
      name: 'Anonymous',
      message: ''
    },
    initialize: function (attrs, opts) {
      this.set({ts: Date.now()});
    }
  });

  var Questions = Backbone.Collection.extend({model: Question});

  this.app || (this.app = {});

  _.extend(this.app, {
    init: function () {
      this.local = new Local();
      this.remote || (this.remote = new Remote());

      this.user || (this.user = new User());
      this.questions || (this.questions = new Questions());
    }
  });

}());