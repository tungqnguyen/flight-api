/* eslint-disable no-restricted-globals */
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const axios = require('axios');
const testData = require('../../tests/data/airport_departures');
const globals = require('../global');

const KEY = globals.key;
const db = new sqlite3.Database(path.join(__dirname, '../database/aviation.db'));
const dir = path.join(__dirname, '/math_64.dll');
db.loadExtension(dir, (err) => { if (err != null) console.log('err from loadExtension', err); });
const airport = {
  getAirportInfo(code) {
    return new Promise(((resolve, reject) => {
      const sql = 'SELECT * FROM airport WHERE icao_code = ? OR iata_code = ?;';
      db.get(sql, [code, code], (err, row) => {
        if (row != undefined) return resolve(row);
        return resolve({});
      });
    }));
  },
  getClosetAirports(latitude, longitude, { type, isoCountry }) {
    // type check
    return new Promise((resolve, reject) => {
      const airportType = ['heliport', 'closed', 'small_airport', 'medium_airport', 'large_airport', 'seaplane_base'];
      if (isNaN(latitude) || isNaN(longitude)) {
        return resolve('Please enter a valid lat lon');
      }
      // Create a query for the closest
      const distance = '(6371 * acos(cos(radians($latitude)) * cos(radians(latitude)) * cos(radians(longitude) - radians($longitude)) + sin(radians($latitude)) * sin(radians(latitude))))';
      let sql = `SELECT name, icao_code, iata_code, latitude, longitude, iso_country, type, ${distance} AS distance FROM airport GROUP BY name, icao_code, iata_code, latitude, longitude, distance ORDER BY distance LIMIT 3;`;
      const params = { $latitude: latitude, $longitude: longitude };
      if (isoCountry != null && type == null) {
        sql = `SELECT name, icao_code, iata_code, latitude, longitude, iso_country, type, ${distance} AS distance FROM airport WHERE iso_country = $iso_country GROUP BY name, icao_code, iata_code, latitude, longitude, iso_country, distance ORDER BY distance LIMIT 3;`;
        params.$iso_country = isoCountry;
      } else if (type != null && isoCountry == null) {
        sql = `SELECT name, icao_code, iata_code, latitude, longitude, iso_country, type, ${distance} AS distance FROM airport WHERE type = $type GROUP BY name, icao_code, iata_code, latitude, longitude, type, distance ORDER BY distance LIMIT 3;`;
        params.$type = type;
      } else if (type != null && isoCountry != null) {
        sql = `SELECT name, icao_code, iata_code, latitude, longitude, iso_country, type, ${distance} AS distance FROM airport WHERE type = $type AND iso_country = $iso_country GROUP BY name, icao_code, iata_code, latitude, longitude, iso_country, type, distance ORDER BY distance LIMIT 3;`;
        params.$iso_country = isoCountry;
        params.$type = type;
      }
      db.all(sql, params, (error, rows) => {
        if (error != null) {
          return reject(error);
        }
        return resolve(rows);
      });
    });
  },
  getAirportsRoute(airportCodes) {
    return new Promise((resolve, reject) => {
      const placeholders = airportCodes.map(value => '?').join(',');
      // prepare parameters for iata_code and icao_code
      const params = airportCodes.concat([...airportCodes]);
      const sql = `SELECT * FROM airport WHERE iata_code IN (${placeholders}) OR icao_code IN (${placeholders});`;
      const response = { properties: [] };
      db.all(sql, params, (error, rows) => {
        if (rows.length != airportCodes.length) {
          return resolve('No route found');
        }
        if (error != null) {
          return reject(error);
        }
        const coordinates = [];
        airportCodes.map((el, index) => {
          for (let i = 0; i < rows.length; i += 1) {
            if (el == rows[i].iata_code || el == rows[i].icao_code) {
              coordinates.push([rows[i].latitude, rows[i].longitude]);
              const prop = `point${index + 1}`;
              response.properties.push({ [prop]: rows[i] });
              break;
            }
          }
        });
        return (coordinates.length != 0) ? resolve({
          type: 'LineString',
          coordinates,
          ...response,
        }) : resolve({});
      });
    });
  },
  getAirportByCountry(isoCountry) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT iata_code, icao_code FROM airport WHERE iso_country = ?';
      const params = isoCountry;
      db.all(sql, params, (error, rows) => {
        resolve(rows);
        if (error) reject(error);
      });
    });
  },
  filterByCountries(flightObj, airportsByCountry) {
    for (let i = 0; i < airportsByCountry.length; i += 1) {
      if (flightObj.arrival.iataCode != undefined
        && flightObj.arrival.iataCode == airportsByCountry[i].iata_code) {
        return true;
      }
      if (flightObj.arrival.icaoCode != undefined
        && flightObj.arrival.icaoCode == airportsByCountry[i].icao_code) {
        return true;
      }
    }
    return false;
  },
  filterByAirline(flightObj, airline) {
    if (flightObj.airline.iataCode == airline || flightObj.airline.icaoCode == airline) {
      return true;
    }
    return false;
  },
  async getAirportFlights(airportCode, { type, destCountry, airline }) {
    if (type == 'arrival' && destCountry != null) return 'invalid parameter destCountry';
    let airportsByCountry = [];
    if (destCountry != null) {
      airportsByCountry = await this.getAirportByCountry(destCountry);
    }
    const url = `http://aviation-edge.com/v2/public/timetable?key=${KEY}&iataCode=${airportCode}&type=${type}`;
    try {
      const response = await axios.get(url);
      const filteredData = response.data.filter((element, i) => {
      // test data to save api calls
      // const filteredData = testData.allFlights.filter((element, i) => {
        let countryFilter = null;
        let airlineFilter = null;
        if (destCountry != null) countryFilter = this.filterByCountries(element, airportsByCountry);
        if (airline != null) airlineFilter = this.filterByAirline(element, airline);
        if (countryFilter == null && airlineFilter == null) return true;
        if (countryFilter == true && airlineFilter == null) return true;
        if (countryFilter == null && airlineFilter == true) return true;
        if (countryFilter && airlineFilter) return true;
      });
      return filteredData;
    } catch (error) {
      console.log('error received', error);
      return [];
    }
  },
};
module.exports = airport;
