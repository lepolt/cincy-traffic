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

//The url we want is: 'www.random.org/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new'
//var options = {
//    //host: '',
//    //host: 'www.random.org',
//    url: 'http://www.buckeyetraffic.org/services/RoadActivity.aspx',
//    //url: 'http://www.ohgo.com/Dashboard.aspx/getTrafficSpeedAndAlertMarkers',
//    //method: 'POST',
//    //contentType: 'application/json; charset=utf-8',
//    //data: '{pointRequestData:{lowLongitude:-87.98041992187498,highLongitude:-80.61958007812498,lowLatitude:37.331007680189614,highLatitude:42.95254114031307,zoomLevel:7,trueArea:,routeDirection:,routeName:,regionList:,citySide:},id:}',
//    success: function (data) {
//      debugger;
//    }
//    //path: '/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new'
//};
//var options = {
//    host: 'ohgo.com',
//    path: '/Dashboard.aspx/getTrafficSpeedAndAlertMarkers',
//    data: '{pointRequestData:{lowLongitude:-87.98041992187498,highLongitude:-80.61958007812498,lowLatitude:37.331007680189614,highLatitude:42.95254114031307,zoomLevel:7,trueArea:,routeDirection:,routeName:,regionList:,citySide:},id:}',
//};

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

//var j = request.jar();
//var cookie = request.cookie('ASP.NET_SessionId=3weq3rqitiju5dw34tj24btb;mapState=bordered;ohgo=cincinnati;');
//var url = 'http://www.ohgo.com/Dashboard.aspx/getTrafficSpeedAndAlertMarkers';
//j.setCookie(cookie, url);
require('request').debug = true;
request.post({
    url: 'http://www.ohgo.com/Dashboard.aspx/getTrafficSpeedAndAlertMarkers',
    //url: 'http://www.ohgo.com/Dashboard.aspx/getTravelTimeSigns',
        //jar: j,
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
                    console.log(i + ' ' + thisOne['CrossroadName'] + '  ExitName: ' + thisOne['ExitName'] + '   spd: ' + thisOne['AverageSpeed']);
                }
                //console.log(body.d['TrafficSpeedAlerts'][17]);
                //console.log(body.d['TrafficSpeedAlerts'][18]);
                //console.log(body.d['TrafficSpeedAlerts'][19]);
                //17, 18, 19
                var cookie1 = httpResponse.headers['set-cookie'][0],
                    cookie2 = httpResponse.headers['set-cookie'][1];
                console.log(cookie1);
                console.log(cookie2);
//debugger;
//console.log(body);
            } catch (e) {

            }
        }
    });


module.exports = app;
