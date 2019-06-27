const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const axios = require('axios');
const globals = require('../global');
const airport = require('./airport');
const testData = require('../../tests/data/airport_departures');

const KEY = globals.key;
const db = new sqlite3.Database(path.join(__dirname, '../database/aviation.db'));
const flight = {
  getFlightRoute(flightNo) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM flight WHERE flight_iata = ? OR flight_icao = ?;';
      db.get(sql, [flightNo, flightNo], (err, row) => {
        if (row != undefined) resolve(row);
        else resolve({});
        if (err != null) {
          console.log('Cant get data', err);
          reject(err);
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
      const sql = `SELECT * FROM airport WHERE iata_code IN (${placeholders}) OR icao_code IN (${placeholders});`;
      db.all(sql, [$departureIata, $arrivalIata, $departureIcao, $arrivalIcao], (error, rows) => {
        // sorting departure and arrival airports
        rows.sort((a, b) => {
          if (a.icao_code == $departureIcao || a.iata_code == $departureIata) {
            return -1;
          }
          return 1;
        });
        resolve(rows);
      });
    });
  },
  async getFlightLocation(iataCode) {
    const url = `http://aviation-edge.com/v2/public/flights?key=${KEY}&flightIata=${iataCode}`;
    // const response = await axios.get(url);
    const response = {};
    response.data = [{
      geography: {
        latitude: 27.5138, longitude: -14.6707, altitude: 10972.8, direction: 212,
      },
      speed: { horizontal: 887.108, isGround: 0, vertical: 0 },
      departure: { iataCode: 'MAD', icaoCode: 'MAD' },
      arrival: { iataCode: 'EZE', icaoCode: 'EZE' },
      aircraft: {
        regNumber: 'ECNBE', icaoCode: 'A359', icao24: '346146', iataCode: 'A359',
      },
      airline: { iataCode: 'IB', icaoCode: 'IBE' },
      flight: { iataNumber: 'IB6841', icaoNumber: 'IBE6841', number: '6841' },
      system: { updated: '1561595967', squawk: '0' },
      status: 'en-route',
    }];
    console.log('url', url);
    if (response.data != null && Array.isArray(response.data)) {
      try {
        const departedAirport = await airport.getAirportInfo(response.data[0].departure.icaoCode);
        const arrivedAirport = await airport.getAirportInfo(response.data[0].arrival.icaoCode);
        [departedAirport, arrivedAirport].map((stop, i) => {
          Object.keys(stop).map((key) => {
            if (!['id', 'home_link', 'wikipedia_link', 'keywords', 'icao_code', 'iata_code'].includes(key)) {
              if (i == 0) {
                response.data[0].departure[key] = stop[key];
              } else {
                response.data[0].arrival[key] = stop[key];
              }
            }
          });
        });
        return response.data[0];
      } catch (error) {
        console.log('error from getting airport info', error);
      }
    }
    return response.data.error;
  },
};
module.exports = flight;
