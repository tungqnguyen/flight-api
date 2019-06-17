/* eslint-disable no-restricted-globals */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../database/aviation.db'));
const dir = path.join(__dirname, '/math_64.dll');
db.loadExtension(dir, (err) => { if (err != null) console.log('err from loadExtension', err); });

const aviationDb = {
  getAirportInfo(code) {
    return new Promise(((resolve, reject) => {
      const sql = 'SELECT * FROM airport WHERE icao_code = ? OR iata_code = ?;';
      db.all(sql, [code, code], (err, rows) => resolve(rows));
    }));
  },
  getClosetAirport(latitude, longitude, type, isoCountry) {
    // type check
    return new Promise((resolve, reject) => {
      const airportType = ['heliport', 'closed', 'small_airport', 'medium_airport', 'large_airport', 'seaplane_base'];
      if (isNaN(latitude) || isNaN(longitude)) {
        return resolve('Please enter a valid lat lon');
      }
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
    });
  },
  getAirportsRoute(airportCodes) {
    return new Promise((resolve, reject) => {
      const placeholders = airportCodes.map(value => '?').join(',');
      const copyAirportCodes = airportCodes.map(val => val);
      const params = airportCodes.concat(copyAirportCodes);
      const sql = `SELECT iata_code, icao_code, latitude, longitude FROM airport WHERE iata_code IN (${placeholders}) OR icao_code IN (${placeholders});`;
      db.all(sql, params, (error, rows) => {
        if (error != null) {
          console.log('err', error);
          return reject(error);
        }
        const coordinates = [];
        airportCodes.map((el) => {
          for (let i = 0; i < rows.length; i += 1) {
            if (el == rows[i].iata_code || el == rows[i].icao_code) {
              coordinates.push([rows[i].latitude, rows[i].longitude]);
              break;
            }
          }
        });
        return (coordinates.length != 0) ? resolve({
          type: 'LineString',
          coordinates,
        }) : resolve({});
      });
    });
  },
  getFlightRoute(flightNo) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM flight WHERE flight_iata = ? OR flight_icao = ?;';
      db.get(sql, [flightNo, flightNo], (err, row) => {
        if (row != undefined) resolve(row);
        else resolve({});
        if (err != null) {
          console.log('cant get data', err);
          reject();
        }
      });
    });
  },
  async getFlightRouteGeoJson(flightNo) {
    return new Promise(async (resolve, reject) => {
      const flightInfo = await this.getFlightRoute(flightNo);
      const {
        departure_iata: $departureIata, arrival_iata: $arrivalIata, departure_icao: $departureIcao,
        arrival_icao: $arrivalIcao,
      } = flightInfo;
      const placeholders = '$departureIata, $arrivalIata, $departureIcao, $arrivalIcao';
      // prepare geoJson
      const sql = `SELECT iata_code, icao_code, latitude, longitude FROM airport WHERE iata_code IN (${placeholders}) OR icao_code IN (${placeholders});`;
      db.all(sql, [$departureIata, $arrivalIata, $departureIcao, $arrivalIcao], (error, rows) => {
        // console.log('all rows', rows);
        let departureCoordinate = [];
        let arrivalCoordinate = [];
        rows.map((element) => {
          if (element.iata_code == $departureIata || element.icao_code == $departureIcao) {
            departureCoordinate = [element.latitude, element.longitude];
          } else arrivalCoordinate = [element.latitude, element.longitude];
        });
        return (departureCoordinate.length != 0 && arrivalCoordinate.length != 0) ? resolve({
          type: 'LineString',
          coordinates: [departureCoordinate, arrivalCoordinate],
        }) : resolve({});
      });
    });
  },
};
module.exports = aviationDb;
