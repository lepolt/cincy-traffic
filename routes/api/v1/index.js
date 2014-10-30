var express = require('express');
var router = express.Router();

router.get('/routeNames', function(req, res) {
  var db = require('../../../db/db');

  db.getRouteNames(function (results) {
    res.json(results);
  });
});

router.get('/route/:id', function (req, res) {
  var db = require('../../../db/db'),
      id = req.params.id;

  db.getRouteData(id, function (err, results) {

    if (!err) {
      res.json(results);
    } else {
//debugger;
    }

  });
});

router.get('/route/:id/day/:date', function (req, res) {
  var db = require('../../../db/db'),
      id = req.params.id,
      date = req.params.date;

  db.getDayForRoute(id, date, function (err, results) {
    if (!err) {
      res.json(results);
    } else {
      //debugger;
    }
  });
});
module.exports = router;
