var express = require('express');
var router = express.Router();

router.get('/stats', function (req, res) {
  var db = require('../../../db/db');

  db.getStats(function (err, results) {
    res.json(results);
  });
});

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

router.get('/route/:id/day/:date/download', function (req, res) {
  var db = require('../../../db/db'),
      //id = req.body.id,
      id = req.params.id,
      //date = req.body.date;
      date = req.params.date;

  db.getDayForRoute(id, date, function (err, results) {
    var csv = require('to-csv');
    var filename = date + '.csv',
        text;

    if (!err) {
      text = csv(results);

      res.set({
        'Content-Disposition': 'attachment; filename="' + filename + '"',
        'Content-Type': 'text/csv',
        'Content-Length': text.length
      });
      res.send(text);
    } else {
      //debugger;
    }
  });
});

module.exports = router;
