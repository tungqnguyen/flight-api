const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const axios = require('axios');
const parse = require('csv-parse');
const globals = require('../global');

const KEY = globals.key;
let db = null;

function createAirportDbCol(array) {
  let columns = '';
  array.map((element) => {
    if (element === 'ident') {
      columns += 'icao_code VARCHAR, ';
    } else if (element === 'latitude_deg') {
      columns += 'latitude DECIMAL(10, 8) NOT NULL, ';
    } else if (element === 'longitude_deg') {
      columns += 'longitude DECIMAL(11, 8) NOT NULL, ';
    } else {
      columns += `${element} VARCHAR, `;
    }
  });
  const result = columns.trimRight().slice(0, columns.length - 2);
  return result;
}
async function airportDbInit() {
  return new Promise(async (resolve, reject) => {
    try {
      db.run('DROP TABLE IF EXISTS airport');
      console.log('creating airport table...');
      const response = await axios.get('http://ourairports.com/data/airports.csv');
      parse(response.data, (err, records) => {
        const cols = createAirportDbCol(records[0]);
        const sql = `CREATE TABLE IF NOT EXISTS airport ( ${cols} )`;
        const placeholders = records[0].map(value => '?').join(',');
        db.serialize(() => {
          db.run(sql);
          db.run('BEGIN');
          console.log('inserting airport records...');
          const stmt = db.prepare(`INSERT INTO airport VALUES (${placeholders})`);
          for (let i = 1; i < records.length; i += 1) {
            stmt.run(records[i]);
          }
          stmt.finalize();
          db.run('COMMIT');
          console.log('airport table created');
          resolve();
        });
      });
    } catch (error) {
      console.log('error while downloading airports data', error);
    }
  });
}
async function flightDbInit() {
  return new Promise(async (resolve, reject) => {
    try {
      db.run('DROP TABLE IF EXISTS flight');
      console.log('creating flight table...');
      const response = await axios.get(`http://aviation-edge.com/v2/public/flights?key=${KEY}`);
      // eslint-disable-next-line max-len
      const str = 'flight_iata CHAR, flight_icao CHAR, departure_iata CHAR, arrival_iata CHAR, departure_icao CHAR, arrival_icao CHAR, airline_iata CHAR';
      const sql = `CREATE TABLE IF NOT EXISTS flight (${str})`;
      const placeholders = '?, ?, ?, ?, ?, ?, ?';
      db.serialize(() => {
        db.run(sql);
        db.run('BEGIN');
        console.log('inserting flight records...');
        const stmt = db.prepare(`INSERT INTO flight VALUES (${placeholders})`);
        response.data.map((val) => {
          const {
            flight, departure, arrival, airline,
          } = val;
          stmt.run(flight.iataNumber, flight.icaoNumber, departure.iataCode, arrival.iataCode,
            departure.icaoCode, arrival.icaoCode, airline.iataCode);
        });
        stmt.finalize();
        db.run('COMMIT');
        console.log('flight table created');
      });
    } catch (error) {
      console.log('error while downloading flights data', error);
    }
  });
}
async function dbInit() {
  try {
    console.log('initialize database');
    db = new sqlite3.Database(path.join(__dirname, '../database/aviation.db'));
    await Promise.all([airportDbInit(), flightDbInit()]);
    console.log('database initialized');
    db.close();
  } catch (error) {
    console.log('err', error);
  }
}

dbInit();
