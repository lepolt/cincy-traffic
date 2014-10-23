var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

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

app.use('/', routes);
app.use('/users', users);

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
var sqlite3 = require('sqlite3'),
    data,
    db;

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
        var newCrossRoads = [],
            newExitNames = [],
            newRouteNames = [],
            alerts;

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
            var date = new Date().toISOString(),
                queryParams = [],
                query,
                thisOne;

            query = 'INSERT INTO traffic (crossroadName, description, direction, directionText, exitName, id, latitude, ' +
            'longitude, roadStatus, routeName, averageSpeed, date) VALUES ';

            for (var i = 0; i < alerts.length; i++) {
              thisOne = alerts[i];

              query += '(?,?,?,?,?,?,?,?,?,?,?,?)'; // The Riddler

              queryParams.push(thisOne['CrossroadName']);
              queryParams.push(thisOne['Description']);
              queryParams.push(thisOne['Direction']);
              queryParams.push(thisOne['DirectionText']);
              queryParams.push(thisOne['ExitName']);
              queryParams.push(thisOne['ID']);
              queryParams.push(thisOne['Latitude']);
              queryParams.push(thisOne['Longitude']);
              queryParams.push(thisOne['RoadStatus']);
              queryParams.push(thisOne['RouteName']);
              queryParams.push(thisOne['AverageSpeed']);
              queryParams.push(date);

              if (i + 1 < alerts.length) {
                query += ',';
              }
            }

            db.run(query, queryParams, function (err) {
              if (err) {
                console.log('Query Error: ' + err.toString());
              } else {
                console.log(date + '   ' + alerts.length + ' records added');
              }
            });

          } catch (e) {

          }
        }
      }
  );
}

db = new sqlite3.Database('traffic.db3', function (err) {
  var schedule = require('node-schedule');
  var rule = new schedule.RecurrenceRule();

  rule.dayOfWeek = [new schedule.Range(1, 5)];
  rule.hour = [new schedule.Range(5, 19)];

  var j = schedule.scheduleJob(rule, function(){
    getTrafficData();
  });

});

module.exports = app;
