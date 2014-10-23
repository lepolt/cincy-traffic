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
var request = require('request');
var sqlite3 = require('sqlite3');

var data = {
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

//var crossRoads = [],
//    exitNames = [],
//    routeNames = [];

var db = new sqlite3.Database('traffic.db3', function (err) {
  setInterval(function () {
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

              query += '(?,?,?,?,?,?,?,?,?,?,?,?)';

              queryParams.push(thisOne['CrossroadName']);//: "Exit 29, SR-63: Monroe, Lebanon"
              queryParams.push(thisOne['Description']);//: "Milepost 27.20"
              queryParams.push(thisOne['Direction']);//: "S"
              queryParams.push(thisOne['DirectionText']);//: "Southbound"
              queryParams.push(thisOne['ExitName']);//: "Exit 29, SR-63: Monroe, Lebanon"
              queryParams.push(thisOne['ID']);//: "11852"
              queryParams.push(thisOne['Latitude']);//: 39.41774
              queryParams.push(thisOne['Longitude']);//: -84.34897
              queryParams.push(thisOne['RoadStatus']);//: "Caution"
              queryParams.push(thisOne['RouteName']);//: "I-75"
              queryParams.push(thisOne['AverageSpeed']);//: 47']);
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

  }, 60000);
});



module.exports = app;
