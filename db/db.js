/**
 * @file
 * @copyright (c) 2014 Turbine Standard, Ltd
 * All Rights Reserved
 */

/*globals exports, module, require */

var db;
var _creationScriptPath = './creationScript.sql';
var _dbFilePath = './db/traffic.db3';
var _expectedDbVersion = 1;

/**
 * Gets a reference to our database
 * @returns {Object} Database instance
 */
exports.getDb = function () {
  return db;
};

/**
 * Connect to our database
 * @param {Function} callback Callback function
 */
exports.connect = function (callback) {
  var sqlite3 = require('sqlite3').verbose(),
      fs = require('fs'),
      dbPath = _dbFilePath,
      mode = sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
      createDatabase = false,
      doCallback = true,
      body = {},
      version,
      eStr;

  //utils.throwIfMissingCallback(callback);

  if (!fs.existsSync(dbPath)) {
    console.log('Database does not exist. I will create one for you.');
    createDatabase = true;
  }

  db = new sqlite3.Database(dbPath, mode, function (err) {
    if (err) {
      body = {};
      console.log('Error opening database: ' + err.toString());
    } else {
      console.log('Opened database: ' + dbPath);

      if (createDatabase) {
        console.log('Running database creation script...');
        doCallback = false; // We'll run the callback after we run the DB script
        module.exports.runCreationScript(_creationScriptPath, function (results) {
          console.log('...done running creation script');
          if (results.errorCode === 1) {
            callback();
          } else {
            callback(results);
          }
        });
      } else {
        // else db exists, let's check the schema version just to make sure we're current
        doCallback = false;
        db.get('PRAGMA user_version', function (err, results) {
          if (err) {
            eStr = 'Error getting database version';
            console.log(eStr);
            callback(body);
          } else {
            version = results.user_version;
            if (version < _expectedDbVersion) {
              // TODO_JEL - Eventually we can upgrade
              eStr = 'Database version (' + version + ') is out of date, expected (' + _expectedDbVersion + '). Create a new database and restart the server.';
              console.log(eStr);
              callback(body);
            } else if (results.user_version > _expectedDbVersion) {
              eStr = 'Database version (' + version + ') is newer than expected (' + _expectedDbVersion + '), aborting app.';
              console.log(eStr);
              callback(body);
            } else {
              console.log('Database version is current (' + version + '), continuing operation');
              callback();
            }
          }
        });
      }
    }

    // Call the callback right now if we're not running a DB script
    if (doCallback) {
      callback(body);
    }
  });

};

/**
 * Runs the database creation script
 * @param callback
 */
exports.runCreationScript = function (creationScriptPath, callback) {
  var //utils = require('../utils'),
      fs = require('fs'),
      //errorHandler = require('../errorHandler'),
      //defines = require('../defines'),
      creationScript = './db/creationScript.sql',
      body = {},
      eStr,
      eCode,
      eLevel;

  //utils.throwIfMissingDb(db);
  //utils.throwIfMissingCallback(callback);

  // Make sure the creation script exists
  if (fs.existsSync(creationScript)) {
    // Open the script, then run the script
    fs.readFile(creationScript, 'utf-8', function (err, data) {
      if (data) {
        // We have loaded the script into memory. Execute it.
        db.exec(data, function (err) {
          if (err) {
            eStr = err.toString();
            //eCode = defines.errorCode.dbCreationScriptFailure;
            //eLevel = defines.errorLevel.critical;

            //utils.populateErrorResponse(body, eCode, eStr, eLevel);
            console.log(eStr);

          } else {
            body.errorCode = 1;
            //utils.populateSuccessResponse(body);
          }
          callback(body);
        });
      } else {
        if (err) {
          //TODO_JEL -
          eStr = err.toString();
          console.log(eStr);

        } else {
          eStr = 'Unknown error reading database creation script';
          console.log(eStr);

        }
        callback(body);
      }
    });

  } else {
    // We have no database. We have no creation script. You do the math.
    debugger;
    //utils.throwIfMissingParams(undefined);
  }
};

/**
 * Closes the database. It would be best if this was done when the node server closes...
 */
exports.close = function () {
  //var /*errorHandler = require('../errorHandler'),
  //    errorLevels = require('../defines').errorLevel,
  //    utils = require('../utils');*/

  //utils.throwIfMissingDb(db);

  db.close();
  console.log('Closed database.');
};

exports.insertTrafficData = function (alerts, callback) {
  var date = new Date().toISOString(),
      queryParams = [],
      query,
      thisOne;

  query = 'INSERT INTO trafficSpeedData (crossroadName, description, direction, directionText, exitName, id, latitude, ' +
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
};

exports.getRouteNames = function (callback) {
  var query = 'SELECT DISTINCT crossroadName, description, directionText FROM trafficSpeedData';

  db.all(query, function (err, results) {
    callback(results);
  });

};

exports.getRouteTrend = function (crossroadName, directionText, minutes, callback) {
  var query = 'SELECT crossroadName, roadStatus, averageSpeed, date ' +
              'FROM trafficSpeedData ' +
              'WHERE crossroadName=$crossroadName AND directionText=$directionText ' +
              'ORDER BY date ASC ' +
              'LIMIT $minutes';

  db.all(query, {
    $crossroadName: crossroadName,
    $directionText: directionText,
    $minutes: minutes
  }, function (err, results) {
    callback(err, results);
  });

};