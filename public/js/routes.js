
App.Router.map(function() {
  // put your routes here
  //this.resource('routes', { path: '/routes/:id' }, function () {
  //  this.route('day', { path: '/day/:date' });
  //});
  this.route('routes', { path: '/' });
  //this.resource('/', { path: '/routes' });
  this.resource('stats');
  this.resource('routes', { path: '/routes' });
  this.resource('route', { path: '/route/:route_id' }, function() {
    this.resource('days', { path: '/days' }, function () {
      //this.resource('trend', { path: '/:days/trend' });
    });
    this.resource('day', { path: '/day/:day_id' }, function () {
      this.resource('speeds');
    });
  });
});

App.RoutesRoute = Ember.Route.extend({
  setupController: function (controller, model) {
    controller.set('model', model);
    this._super();
  },

  model: function() {
    return Ember.$.getJSON('/api/v1/routeNames').then(function(data) {
      return data.map(function (item) {
        return Ember.Object.create(item);
      });
    });
  },

  actions: {
    submitClicked: function () {
      this.transitionTo('days', this.controllerFor('routes').get('selectedRoute.id'));
    }
  }
});

App.RouteRoute = Ember.Route.extend({
  model: function(params) {
    return Ember.Object.create({
      id: params.route_id
    });
  }
});

App.DaysRoute = Ember.Route.extend({

  setupController: function (controller, model) {
    controller.set('model', model);
    controller.set('routeId', this.modelFor('route').id);
    this._super();
  },

  model: function (data) {
    var url = '/api/v1/route/' + this.modelFor('route').id,
        days;

    return Ember.$.getJSON(url).then(function (results) {
      App.Traffic[data.name] = results;

      days = results.map(function (item) {
        return moment(item.date).format('YYYY-MM-DD');
      });
      return days.uniq().sort().map(function (item) {
        return Ember.Object.create({ name: item, isSelected: false });
      });
    });
  }

});

App.DayRoute = Ember.Route.extend({
  model: function(params) {
    return Ember.Object.create({
      date: params.day_id
    });
  }
});

App.SpeedsRoute = Ember.Route.extend({

  setupController:function (controller, model) {
    this._super();
    controller.set('model', model);
    controller.set('routeId', this.modelFor('route').id);
    controller.set('date', this.modelFor('day').date);
  },

  model: function (params) {
    var id = this.modelFor('route').id,
        date = this.modelFor('day').date,
        url = '/api/v1/route/' + id + '/day/' + date;

    // TODO JEL: lol, this is already stored in the days route :(
    return Ember.$.getJSON(url).then(function (results) {
      return results.map(function (item) {
        return Ember.Object.create({
          averageSpeed: item.averageSpeed,
          time: moment(item.date).seconds(0)
        })
      });
    });
  }
});

App.StatsRoute = Ember.Route.extend({
  model: function (params) {
    var url = '/api/v1/stats';

    return Ember.$.getJSON(url).then(function (data) {
      return Ember.Object.create(data);
    });
  }
});