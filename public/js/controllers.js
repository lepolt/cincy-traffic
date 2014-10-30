
App.RoutesController = Ember.Controller.extend({
//App.IndexController = Ember.Controller.extend({
  minutes: null,
  selectedRoute: {},
  selectedRouteDisplayName: function() {
    var selectedRoute = this.get('selectedRoute');

    return selectedRoute.crossroadName + '  (' + selectedRoute.direction + ')';
  }.property('selectedRoute'),

  trafficRoutes: function () {
    return this.get('model').map(function (item) {
      return Ember.Object.create({
        id: item.id,
        crossroadName: item.crossroadName,
        direction: item.directionText,
        routeName: item.routeName
      });
    });
  }.property()

});

App.DaysController = Ember.Controller.extend({
  numRecords: Ember.computed.alias('model.length'),

  uniqueDays: function() {
    var model = this.get('model'),
        days = model.map(function (item) {
      var date = new Date(item.date),
          year = date.getFullYear(),
          month = date.getMonth() + 1,
          day = date.getDate();

      return (year + '-' + month + '-' + day);
    });

    return days.uniq().sort();

  }.property('model')
});