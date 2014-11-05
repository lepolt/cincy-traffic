
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