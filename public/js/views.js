
App.SpeedsView = Ember.View.extend({
  templateName: 'speeds',

  buildChart: function (morning) {
    var $chart = morning ? $('#amChart') : $('#pmChart'),
        times = this.get('controller').getTimes(morning),
        speeds = this.get('controller').getSpeeds(morning),
        ctx;

    if (times.length && $chart.get(0)) {
      ctx = $chart.get(0).getContext('2d');

      var data = {
        labels: times,
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