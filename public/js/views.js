
App.DaysView = Ember.View.extend({
  chart: null,

  _speedDataDidChange: function() {
    console.log('_speedDataDidChange');
    this.buildChart();
  }.observes('controller.speedData'),

  createSpeedDataset: function (day) {
    var speedData = this.get('controller.speedData'),
        thisDay = speedData[day],
        speedsList,
        dataset = [];

    if (thisDay) {
      speedsList = _.map(thisDay, function (item) {
        return item.averageSpeed;
      });
    }

    dataset = {
      label: day,
      fillColor: 'rgba(220,220,220,0.2)',
      strokeColor: 'rgba(220,220,220,1)',
      pointColor: 'rgba(220,220,220,1)',
      pointStrokeColor: '#fff',
      pointHighlightFill: '#fff',
      pointHighlightStroke: 'rgba(220,220,220,1)',
      data: speedsList
    };

    return dataset;
  },

  buildChart: function () {
console.log('speeding chart');
    var $chart = $('#trend-chart'),
        speedData = this.get('controller.speedData'),
        times = this.get('controller.times'),
        selection = this.get('controller.selection'),
        chart = this.get('chart'),
        newChart,
        modLabel,
        datasets,
        data,
        ctx;

    if (speedData && times && times.length && $chart.get(0)) {
      ctx = $chart.get(0).getContext('2d');
      modLabel = Math.ceil(times.length/90);

      datasets = _.map(selection, function (day) {
        return this.createSpeedDataset(day);
      }.bind(this));

      data = {
        labels: _.map(times, function (item, index) {
          var strRet = '';
          if (index % modLabel === 0) {
            strRet = item;
          }
          return strRet;
        }),
        datasets: datasets

      };

      if (chart) {
        //debugger;
        chart.clear();
        //chart.datasets = datasets;
        //chart.update();
      }
      //else {
      //
      //  chart = new Chart(ctx).Line(data, {
      //    bezierCurve: false,
      //    responsive: true
      //  });
      //}
      chart = new Chart(ctx).Line(data, {
        bezierCurve: false,
        responsive: true
      });
chart.update();
      this.set('chart', chart);
    } else {
      //$chart.remove();
    }
  }

});

App.TrendView = Ember.View.extend({
  templateName: 'trend',

  didInsertElement: function() {
    this._super();
  debugger;
    var model = this.get('model'),
        controller = this.get('controller');
  },

  buildChart: function () {

  }

});

App.SpeedsView = Ember.View.extend({
  templateName: 'speeds',

  buildChart: function (morning) {
    var $chart = morning ? $('#amChart') : $('#pmChart'),
        times = this.get('controller').getTimes(morning),
        speeds = this.get('controller').getSpeeds(morning),
        modLabel,
        data,
        ctx;

    if (times.length && $chart.get(0)) {
      ctx = $chart.get(0).getContext('2d');
      modLabel = Math.ceil(times.length/90);

      data = {
        labels: _.map(times, function (item, index) {
          var strRet = '';
          if (index % modLabel === 0) {
            strRet = item;
          }
          return strRet;
        }),
        datasets: [
          {
            label: 'My First dataset',
            fillColor: 'rgba(220,220,220,0.2)',
            strokeColor: 'rgba(220,220,220,1)',
            pointColor: 'rgba(220,220,220,1)',
            pointStrokeColor: '#fff',
            pointHighlightFill: '#fff',
            pointHighlightStroke: 'rgba(220,220,220,1)',
            data: speeds
          }
        ]
      };

      var myLineChart = new Chart(ctx).Line(data, {
        bezierCurve: false
      });
    } else {
      $chart.remove();
    }
  },

  didInsertElement: function() {
    this._super();
    this.buildChart(true);
    this.buildChart(false);
  }

});