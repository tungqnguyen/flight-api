/* eslint-disable prefer-destructuring */
/* eslint-disable arrow-body-style */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-globals */
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const axios = require('axios');
const redis = require('redis');
const { promisify } = require('util');
const globals = require('../global');
const testData = require('../../tests/data/airport_departures');
// redis init
const client = redis.createClient();
// making redis functions to return promise
const getAsync = promisify(client.get).bind(client);
const ttl = promisify(client.ttl).bind(client);

client.on('connect', () => {
  console.log('Redis client connected');
});

const KEY = globals.key;
const db = new sqlite3.Database(path.join(__dirname, '../database/aviation.db'));
const dir = path.join(__dirname, '/math_64.dll');
client.on('error', (err) => {
  console.log(`Error ${err}`);
});
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
  // params is array
  getClosetAirports(latitude, longitude, { typeArr, isoCountryArr, limit }) {
    // type check
    return new Promise((resolve, reject) => {
      // list of valide airport types
      const airportType = ['heliport', 'closed', 'small_airport', 'medium_airport', 'large_airport', 'seaplane_base'];
      if (isNaN(latitude) || isNaN(longitude)) {
        return resolve('Please enter a valid lat lon');
      }
      // Create a query for the closest
      let params = [latitude, longitude, latitude];
      const distance = '(6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude))))';
      let sql = `SELECT name, icao_code, iata_code, latitude, longitude, iso_country, type, ${distance} AS distance FROM airport GROUP BY name, icao_code, iata_code, latitude, longitude, distance ORDER BY distance LIMIT ${limit};`;
      // creating placeholders
      let isoCountryPlaceHolder = null;
      let typePlaceHolder = null;
      if (isoCountryArr != null) isoCountryPlaceHolder = isoCountryArr.map(value => '?').join(',');
      if (typeArr != null) typePlaceHolder = typeArr.map(value => '?').join(',');
      // sort by countries
      if (isoCountryArr != null && typeArr == null) {
        sql = `SELECT name, icao_code, iata_code, latitude, longitude, iso_country, type, ${distance} AS distance FROM airport WHERE iso_country IN (${isoCountryPlaceHolder}) GROUP BY name, icao_code, iata_code, latitude, longitude, iso_country, distance ORDER BY distance LIMIT ${limit};`;
        params = params.concat(isoCountryArr);
      // sort by type of airports
      } else if (typeArr != null && isoCountryArr == null) {
        sql = `SELECT name, icao_code, iata_code, latitude, longitude, iso_country, type, ${distance} AS distance FROM airport WHERE type IN (${typePlaceHolder}) GROUP BY name, icao_code, iata_code, latitude, longitude, type, distance ORDER BY distance LIMIT ${limit};`;
        params = params.concat(typeArr);
      // sort by both countries and type of airports
      } else if (typeArr != null && isoCountryArr != null) {
        sql = `SELECT name, icao_code, iata_code, latitude, longitude, iso_country, type, ${distance} AS distance FROM airport WHERE type IN (${typePlaceHolder}) AND iso_country IN (${isoCountryPlaceHolder}) GROUP BY name, icao_code, iata_code, latitude, longitude, iso_country, type, distance ORDER BY distance LIMIT ${limit};`;
        params = params.concat(typeArr);
        params = params.concat(isoCountryArr);
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
      db.all(sql, params, (error, rows) => {
        if (rows.length != airportCodes.length) {
          return resolve('No route found');
        }
        if (error != null) {
          return reject(error);
        }
        rows.sort((a, b) => {
          if (airportCodes.indexOf(a.iata_code) < airportCodes.indexOf(b.iata_code)) {
            return -1;
          }
          return 1;
        });
        resolve(rows);
      });
    });
  },
  getAirportsByCountry(isoCountry) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT iata_code, icao_code FROM airport WHERE iso_country = ?';
      const params = isoCountry;
      db.all(sql, params, (error, rows) => {
        resolve(rows);
        if (error) reject(error);
      });
    });
  },
  cacheData(key, data) {
    console.log(`cache ${key}`);
    client.setex(key, 3600, data);
  },
  filterByCountries(flightObj, airportsByCountry) {
    for (let i = 0; i < airportsByCountry.length; i += 1) {
      if (
        flightObj.arrival.iataCode != undefined
        && flightObj.arrival.iataCode == airportsByCountry[i].iata_code
      ) {
        return true;
      }
      if (
        flightObj.arrival.icaoCode != undefined
        && flightObj.arrival.icaoCode == airportsByCountry[i].icao_code
      ) {
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
  async filterByParams(flightList, paramsObject) {
    let destCountry = null;
    let airline = null;
    let airportsByCountry = [];
    if (paramsObject.destCountry != null) {
      destCountry = paramsObject.destCountry;
      airportsByCountry = await this.getAirportsByCountry(destCountry);
    }
    if (paramsObject.airline != null) {
      airline = paramsObject.airline;
    }
    const filteredData = flightList.filter((element, i) => {
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
  },
  async getAirportFlights(airportCode, {
    type, destCountry, airline,
  }) {
    if (type == 'arrival' && destCountry != null) return 'invalid parameter destCountry';
    let filteredData = [];
    let response = null;
    const url = `http://aviation-edge.com/v2/public/timetable?key=${KEY}&iataCode=${airportCode}&type=${type}`;
    try {
      const cachedData = await getAsync(url);
      if (cachedData) {
        response = JSON.parse(cachedData);
        const sec = await ttl(url);
        console.log('expire in', `${sec} sec`);
        response = await this.filterByParams(response, { destCountry, airline });
        response.forEach((val, i) => {
          val.stops = [val.departure, val.arrival];
          delete val.arrival;
          delete val.departure;
        });
        return response;
      }
      response = await axios.get(url);
      // response = { data: testData.allFlights };
      if (Array.isArray(response.data) && response.data.length > 0) {
        const jsonData = JSON.stringify(response.data);
        this.cacheData(url, jsonData);
        filteredData = await this.filterByParams(response.data, { destCountry, airline });
        // format departure and arrival into stops
        filteredData.forEach((val, i) => {
          val.stops = [val.departure, val.arrival];
          delete val.arrival;
          delete val.departure;
        });
      }
      return filteredData;
    } catch (error) {
      console.log('error received', error);
      return [];
    }
  },
};
module.exports = airport;
