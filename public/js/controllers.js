
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
  timeFormat: 'HH:mm A',
  shortTimeFormat: 'h:mm A',
  speedData: {},
  startValue: 6,
  endValue: 9,

  startTime: function() {
    var str = this.getTimeString(this.get('startValue')),
        timeFormat = this.get('timeFormat');

    return moment(str, timeFormat);
  }.property('startValue'),

  endTime: function() {
    var str = this.getTimeString(this.get('endValue')),
        timeFormat = this.get('timeFormat');

    return moment(str, timeFormat);
  }.property('endValue'),


  startTimeStr: function() {
    return (this.get('startTime').format(this.get('shortTimeFormat')));
  }.property('startTime', 'timeFormat'),

  endTimeStr: function() {
    return (this.get('endTime').format(this.get('shortTimeFormat')));
  }.property('endTime', 'timeFormat'),

  minutes: function() {
    var startTime = this.get('startTime'),
        endTime = this.get('endTime');

    return endTime.diff(startTime, 'minutes');
  }.property('startTime', 'endTime'),

  getTimeString: function (timeVal) {
    if (!timeVal) {
      return '';
    }

    var timeSections = timeVal.toString().split('.'),
        hours = timeSections[0],
        amPm = hours < 12 ? 'AM' : 'PM',
        minutes = '00',
        timeStr;

    if (timeSections.length === 2) {
      minutes = timeSections[1];
      switch (minutes) {
        case '25':
          minutes = '15';
          break;
        case '5':
          minutes = '30';
          break;
        case '75':
          minutes = '45';
          break;
        default:
          minutes = '00';
      }
    }

    return hours + ':' + minutes + ' ' + amPm;
  },

  // If start or end times change we need to update all our data
  _startEndTimeDidChange: function() {
    console.log('_startEndTimeDidChange');
    Ember.run.debounce(this, this.resetAndGetData, 1000);
  }.observes('startValue', 'endValue'),

  resetAndGetData: function () {
console.log('resetAndGetData');
    // Kill cache and re-fetch
    this.set('speedData', {});
    this.getData();
  },

  _initSelection: function () {
    this.set('selection', []);
  }.on('init'),

  // When the date selection changes, update
  _selectionDidChange: function() {
    var selection = this.get('selection');

    if (selection && selection.length > 0) {
      this.getData(this.get('selection'));
    }
  }.observes('selection.length'),

  times: function() {
    var times,
        speedData = this.get('speedData'),
        timeSpeedList = speedData[this.get('selection')[0]],
        format = this.get('timeFormat');

    return _.map(timeSpeedList, function (item) {
      return item.time.format(format);
    });
  }.property('speedData', 'selection'),

  getData: function () {
console.log('getData');
    var id = this.get('routeId'),
        url = '/api/v1/route/' + id + '/days/',
        daysToFetch = [],
        speedData = this.get('speedData'),
        speedsPerDay = {},
        startTime = this.get('startTime'),
        time = moment().hour(startTime.hour()).minute(startTime.minute()).second(0),
        allTimeSpeedList = [],
        minutes = this.get('minutes'),
        days = this.get('selection'),
        i;

    if (minutes <= 0 || days.length <= 0) {
      return;
    }

    // Create an array of all possible times we could need
    for (i = 0; i < minutes; i++) {
      allTimeSpeedList.push({
        time: moment(time),
        averageSpeed: 50
      });
      time.add(1, 'minute');
    }

    // First check speedData to see if we have any of the requested dates. If yes, we don't need to re-fetch.
    daysToFetch = _.filter(days, function (thisDay) {
      return (!speedData.hasOwnProperty(thisDay))
    });

    // Append days to fetch to our URL
    url += daysToFetch;

    // Make the request
    Ember.$.getJSON(url).then(function (results) {
      var timeSpeedList,
          format = this.get('timeFormat'),
          dateFormat = 'YYYY-MM-DD';

      // First reformat our data
      timeSpeedList = results.map(function (item) {
        return Ember.Object.create({
          averageSpeed: item.averageSpeed,
          time: moment(item.date).seconds(0)
        })
      }.bind(this));

      // results contains ALL of the results for all requested days in one array. We need to break it down
      _.each(days, function (day) {
        var dayStr = moment(day).format(dateFormat),
            allTimesAndSpeedsForToday = _.clone(allTimeSpeedList); // Close this array so it can be re-purposed

        if (!speedData.hasOwnProperty(day)) {
          // This will separate all the dates from the results list
          speedsPerDay[day] = _.filter(timeSpeedList, function (item) {
            return moment(item.time).format(dateFormat) === dayStr;
          });

          // Find and replace times in the allTimeSpeedList
          _.each(speedsPerDay[day], function (item, index) {
            var foundIndex,
                foundIt;

            // Now replace the default 50mph values in the array with actual speeds if they exist
            foundIt = _.find(allTimesAndSpeedsForToday, function (allItem, index) {
              foundIndex = index;
              return (allItem.time.format(format) === item.time.format(format));
            });

            if (foundIt) {
              allTimesAndSpeedsForToday[foundIndex] = item;
            }
          });

          // Update our object
          speedData[day] = allTimesAndSpeedsForToday;
        }

      }.bind(this));

      // Update our property
      this.set('speedData', speedData);
      this.notifyPropertyChange('speedData');

    }.bind(this));
  }

});

App.SelectionHelperController = Ember.ObjectController.extend({
  selectionModelKey: 'name',

  isSelected: function(key, value) {
    var selection = this.get('parentController.selection'),
        selectionModelKey = this.get('selectionModelKey'),
        model = this.get('model'),
        selectionValue = model.get(selectionModelKey);

    if(arguments.length > 1) {
      if(value) {
        if(!selection.contains(selectionValue)) {
          selection.pushObject(selectionValue);
        }
      } else {
        selection.removeObject(selectionValue);
      }
    }

    return selection.contains(selectionValue);
  }.property('parentController.selection')
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
        format = this.get('timeFormat'),
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
        format = this.get('timeFormat'),
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
        format = this.get('timeFormat');

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
