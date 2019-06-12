/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable use-isnan */
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const airportDb = {
  getDataByCode(code, type) {
    return new Promise(((resolve, reject) => {
      if (type.includes('airport')) {
        // open db
        const db = new sqlite3.Database(path.join(__dirname, '../databases/aviation.db'));
        console.log('run');
        // get data
        const sql = 'SELECT * FROM airport WHERE icao_code = ? OR iata_code = ?;';
        db.all(sql, [code, code], (err, rows) => resolve(rows));
      } else {
        return reject();
      }
    }));
  },
  getClosetAirport(latitude, longitude, type, isoCountry) {
    // type check
    return new Promise(((resolve, reject) => {
      const airportType = ['heliport', 'closed', 'small_airport', 'medium_airport', 'large_airport', 'seaplane_base'];
      if (Number(latitude) == NaN || Number(longitude) == NaN) {
        return reject('Please enter a valid lat lon');
      }
      const db = new sqlite3.Database(path.join(__dirname, '../databases/aviation.db'));
      const dir = path.join(__dirname, '../databases/math_64');
      db.loadExtension(dir, (err) => { if (err != null) console.log('err', err); });
      // Create a query for the closest
      const distance = '(6371 * acos(cos(radians($latitude)) * cos(radians(latitude)) * cos(radians(longitude) - radians($longitude)) + sin(radians($latitude)) * sin(radians(latitude))))';
      let sql = `SELECT name, icao_code, iata_code, latitude, longitude, ${distance} AS distance FROM airport GROUP BY name, icao_code, iata_code, latitude, longitude, distance ORDER BY distance LIMIT 3;`;
      const params = { $latitude: latitude, $longitude: longitude };
      if (isoCountry != null && type == null) {
        sql = `SELECT name, icao_code, iata_code, latitude, longitude, iso_country, ${distance} AS distance FROM airport WHERE iso_country = $iso_country GROUP BY name, icao_code, iata_code, latitude, longitude, iso_country, distance ORDER BY distance LIMIT 3;`;
        params.$iso_country = isoCountry;
      } else if (type != null && isoCountry == null) {
        sql = `SELECT name, icao_code, iata_code, latitude, longitude, type, ${distance} AS distance FROM airport WHERE type = $type GROUP BY name, icao_code, iata_code, latitude, longitude, type, distance ORDER BY distance LIMIT 3;`;
        params.$type = type;
      } else if (type != null && isoCountry != null) {
        sql = `SELECT name, icao_code, iata_code, latitude, longitude, iso_country, type, ${distance} AS distance FROM airport WHERE type = $type AND iso_country = $iso_country GROUP BY name, icao_code, iata_code, latitude, longitude, iso_country, type, distance ORDER BY distance LIMIT 3;`;
        params.$iso_country = isoCountry;
        params.$type = type;
      }
      db.all(sql, params, (error, rows) => {
        if (error != null) {
          console.log('err', error);
          return reject(error);
        }

        return resolve(rows);
      });
    }));
  },
};
module.exports = airportDb;
