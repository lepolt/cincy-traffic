var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  var db = require('../db/db');

  db.getRouteNames(function (results) {
    res.render('index', {
      title: 'Express',
      routes: results
    });
  });

});

/* GET home page. */

router.get('/routes/trend', function (req, res) {
  var crossroadName = req.query.crossroadName,
      directionText = req.query.directionText,
      minutes = req.query.minutes,
      db = require('../db/db');

  db.getRouteTrend(crossroadName, directionText, minutes, function (err, results) {
    if (!err) {
      res.render('routeTrend', {
        routes: results
      });
    } else {
      debugger;
    }
  });
});
module.exports = router;
