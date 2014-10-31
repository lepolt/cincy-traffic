
App.RoutesController = Ember.Controller.extend({
  trafficRoutes: function () {
    return this.get('model').map(function (item) {
      return Ember.Object.create({
        id: item.id,
        crossroadName: item.crossroadName,
        direction: item.directionText,
        routeName: item.routeName
      });
    });
  }.property('model')

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

App.SpeedsController = Ember.Controller.extend({
  routeId: null,
  date: null,

  morning: function () {
    return this.get('model').filter(function (item) {

      var time = moment(item.time, 'h:mm:ss A');

      if (time.isBefore(9, 'hour')) {
        return item;
      }
    });
  }.property('model'),

  afternoon: function () {
    return this.get('model').filter(function (item) {
      var time = moment(item.time, 'h:mm:ss A');

      if (time.isAfter(14, 'hour')) {
        return item;
      }
    });
  }.property('model'),

  getTimes: function (morning) {
    if (morning) {
      return this.get('morning').map(function (item) {
        return item.time;
      });
    } else {
      return this.get('afternoon').map(function (item) {
        return item.time;
      });
    }
  },

  getSpeeds: function (morning) {
    if (morning) {
      return this.get('morning').map(function (item) {
        return item.averageSpeed;
      });
    } else {
      return this.get('afternoon').map(function (item) {
        return item.averageSpeed;
      });
    }
  },

  url: function() {
    var id = this.get('routeId'),
        date = this.get('date'),
        url = '/api/v1/route/' + id + '/day/' + date + '/download';

    return url;
  }.property('routeId', 'date')
});