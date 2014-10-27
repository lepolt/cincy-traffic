PRAGMA foreign_keys=ON;
PRAGMA journal_mode=WAL;
PRAGMA user_version=1;

BEGIN TRANSACTION;

CREATE TABLE [trafficSpeedData] (
  crossroadName TEXT,
  description TEXT,
  direction TEXT,
  directionText TEXT,
  exitName TEXT,
  id NUMERIC,
  latitude NUMERIC,
  longitude NUMERIC,
  roadStatus TEXT,
  routeName TEXT,
  averageSpeed NUMERIC,
  date DATETIME
);

COMMIT;
