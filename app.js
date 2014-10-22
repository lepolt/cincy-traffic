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
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

/**********************************************************************************************************************/
var http = require('http');
var request = require('request');

var data = {
    pointRequestData: {
        lowLongitude: -87.98041992187498,
        highLongitude: -80.61958007812498,
        lowLatitude: 37.331007680189614,
        highLatitude: 42.95254114031307,
        zoomLevel: 7,
        trueArea: '',
        routeDirection: '',
        routeName: '',
        regionList: '',
        citySide: ''
    },
    id: ''
};

var crossRoads = [],
    exitNames = [],
    routeNames = [];

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
            if (!err) {
                try {

                    // This will get the signs (I think)
                    //for (var i = 0; i < body.d.length; i++) {
                    //    var thisOne = body.d[i];
                    //    console.log(i + ' ' + thisOne['Description'] + '   x: ' + thisOne['Times'][0]['Description']);
                    //}

                    // This will get some info
                    for (var i = 0; i < body.d['TrafficSpeedAlerts'].length; i++) {
                        var thisOne = body.d['TrafficSpeedAlerts'][i];
                        var crossRoad = thisOne['CrossroadName'];
                        var exitName = thisOne['ExitName'];
                        var routeName = thisOne['RouteName'];

                        if (crossRoads.indexOf(crossRoad) === -1) {
                            crossRoads.push(crossRoad);
                        }

                        if (exitNames.indexOf(exitName) === -1) {
                            exitNames.push(exitName);
                        }

                        if (routeNames.indexOf(routeName) === -1) {
                            routeNames.push(routeName);
                        }
                        //console.log(i + ' ' + thisOne['CrossroadName'] + '  ExitName: ' + thisOne['ExitName'] + '   spd: ' + thisOne['AverageSpeed']);
                    }

                    console.log('CrossRoads: ' + crossRoads.length + '   Exits: ' + exitNames.length + '   Routes: ' + routeNames.length);
                    debugger;
                } catch (e) {

                }
            }
        }
    );

}, 10000);


module.exports = app;
