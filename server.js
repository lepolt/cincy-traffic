var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var api = require('./routes/api/v1/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'client')));

app.use('/', routes);
app.use('/api/v1', api);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

/**********************************************************************************************************************/
var db = require('./db/db'),
    schedule = require('node-schedule'),
    rule = new schedule.RecurrenceRule(),
    data;

data = {
  pointRequestData: {
    lowLongitude: -84.73910980224608,
    highLongitude: -84.05589752197264,
    lowLatitude: 39.0238657144221,
    highLatitude: 39.40424813495791,
    zoomLevel: 11,
    trueArea: '',
    routeDirection: '',
    routeName: '',
    regionList: '',
    citySide: ''
  },
  id: ''
};

function getTrafficData () {
  var request = require('request');
  request.post({
        url: 'http://www.ohgo.com/Dashboard.aspx/getTrafficSpeedAndAlertMarkers',
        //url: 'http://www.ohgo.com/Dashboard.aspx/getTravelTimeSigns',
        body: data,
        json: true,
        headers: {
          'Content-Type': 'application/json; charset=UTF-8'
        }
        //cookie: 'mapState=bordered; ohgo=cincinnati;'
      },
      function (err, httpResponse, body) {
        var alerts;

        if (!err) {
          try {
            // I only care about I-75 traffic
            alerts = body.d['TrafficSpeedAlerts'].filter(function (item) {
              return item['RouteName'] === 'I-75';
            });

            // This will get the signs (I think)
            //for (var i = 0; i < body.d.length; i++) {
            //    var thisOne = body.d[i];
            //    console.log(i + ' ' + thisOne['Description'] + '   x: ' + thisOne['Times'][0]['Description']);
            //}

            // This will get some info
            //for (var i = 0; i < body.d['TrafficSpeedAlerts'].length; i++) {
            db.insertTrafficData(alerts, function (err) {
              if (err) {
                // TODO JEL: Do something
              }
            });
          } catch (e) {

          }
        }
      }
  );
}

// Connect to the DB
db.connect(function (err) {
  if (!err) {
    rule.dayOfWeek = [new schedule.Range(1, 5)];
    rule.hour = [new schedule.Range(5, 19)];

    var j = schedule.scheduleJob(rule, function(){
      getTrafficData();
    });
  }
});

module.exports = app;
