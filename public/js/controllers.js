
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
  morningStart: 6,
  morningEnd: 9,
  morningMinutes: function() {
    return (this.get('morningEnd') - this.get('morningStart')) * 60;
  }.property('morningStart', 'morningEnd'),
  
  afternoonStart: 14,
  afternoonEnd: 18,
  afternoonMinutes: function() {
    return (this.get('afternoonEnd') - this.get('afternoonStart')) * 60;
  }.property('afternoonStart', 'afternoonEnd'),

  allMorning: function () {
    var i,
        time = moment().hour(this.get('morningStart')).minute(0).second(0),
        timeSpeedList = this.get('morning'),
        format = 'HH:mm A',
        allTimeSpeedList = [];

    if (timeSpeedList.length) {
      for (i = 0; i < this.get('morningMinutes'); i++) {
        allTimeSpeedList.push({
          time: moment(time),
          averageSpeed: 50
        });
        time.add(1, 'minute');
      }

      // Find and replace times in the allTimeSpeedList
      _.each(timeSpeedList, function (item, index) {
        var foundIndex,
            foundIt;

        foundIt = _.find(allTimeSpeedList, function (allItem, index) {
          foundIndex = index;
          return (allItem.time.format(format) === item.time.format(format));
        });

        if (foundIt) {
          allTimeSpeedList[foundIndex] = item;
        }
      });
    }

    return allTimeSpeedList;
  }.property('morningStart', 'morningMinutes', 'morning'),

  allAfternoon: function () {
    var i,
        time = moment().hour(this.get('afternoonStart')).minute(0).second(0),
        timeSpeedList = this.get('afternoon'),
        format = 'HH:mm A',
        allTimeSpeedList = [];

    if (timeSpeedList.length) {
      for (i = 0; i < this.get('afternoonMinutes'); i++) {
        allTimeSpeedList.push({
          time: moment(time),
          averageSpeed: 50
        });
        time.add(1, 'minute');
      }

      // Find and replace times in the allTimeSpeedList
      _.each(timeSpeedList, function (item, index) {
        var foundIndex,
            foundIt;

        foundIt = _.find(allTimeSpeedList, function (allItem, index) {
          foundIndex = index;
          return (allItem.time.format(format) === item.time.format(format));
        });

        if (foundIt) {
          allTimeSpeedList[foundIndex] = item;
        }
      });
    }

    return allTimeSpeedList;
  }.property('afternoonStart', 'afternoonMinutes', 'afternoon'),
  
  morning: function () {
    return this.get('model').filter(function (item) {
      var morningStart = this.get('morningStart'),
          morningEnd = this.get('morningEnd'),
          time = moment(item.time, 'h:mm:ss A'),
          hour;

      if (moment.isMoment(time)) {
        hour = time.hour();
        
        // Between morningStart and morningEnd  
        if (hour >= morningStart && hour < morningEnd) {
          return item;
        }
      }
    }.bind(this));
  }.property('model', 'morningStart', 'morningEnd'),

  afternoon: function () {
    return this.get('model').filter(function (item) {
      var afternoonStart = this.get('afternoonStart'),
          afternoonEnd = this.get('afternoonEnd'),
          time = moment(item.time, 'h:mm:ss A'),
          hour;

      if (moment.isMoment(time)) {
        hour = time.hour();

        // Between afternoonStart and afternoonEnd  
        if (hour >= afternoonStart && hour < afternoonEnd) {
          return item;
        }
      }
    }.bind(this));
  }.property('model', 'afternoonStart', 'afternoonEnd'),

  getTimes: function (morning) {
    var times,
        timeSpeedList,
        allTimeSpeedList = morning ? this.get('allMorning') : this.get('allAfternoon'),
        format = 'HH:mm A';

    return _.map(allTimeSpeedList, function (item) {
      return item.time.format(format);
    });
  },

  getSpeeds: function (morning) {
    var speeds,
        timeSpeedList,
        allTimeSpeedList = morning ? this.get('allMorning') : this.get('allAfternoon');

    return _.map(allTimeSpeedList, function (item) {
      return item.averageSpeed;
    });
  },

  url: function() {
    var id = this.get('routeId'),
        date = this.get('date'),
        url = '/api/v1/route/' + id + '/day/' + date + '/download';

    return url;
  }.property('routeId', 'date')
});