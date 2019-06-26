const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const axios = require('axios');
const globals = require('../global');
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
        const departureProperties = {};
        let departureCoordinate = [];
        const arrivalProperties = {};
        let arrivalCoordinate = [];
        console.log('rows', rows);
        rows.map((element) => {
          if (element.iata_code == $departureIata || element.icao_code == $departureIcao) {
            departureCoordinate = [element.latitude, element.longitude];
            Object.keys(element).map((key) => {
              departureProperties[key] = element[key];
            });
          } else {
            arrivalCoordinate = [element.latitude, element.longitude];
            Object.keys(element).map((key) => {
              arrivalProperties[key] = element[key];
            });
          }
        });
        return (departureCoordinate.length != 0 && arrivalCoordinate.length != 0) ? resolve({
          type: 'LineString',
          coordinates: [departureCoordinate, arrivalCoordinate],
          properties: [{ departureProperties }, { arrivalProperties }],
        }) : resolve({});
      });
    });
  },
  async getFlightLocation(iataCode) {
    const url = `http://aviation-edge.com/v2/public/flights?key=${KEY}&flightIata=${iataCode}`;
    const response = await axios.get(url);
    if (response.data != null && Array.isArray(response.data)) {
      const { geography } = response.data[0];
      return {
        type: 'Point',
        coordinates: [geography.latitude, geography.longitude],
        properties: [{ ...response.data[0] }],
      };
    }
    return response.data.error;
  },
};
module.exports = flight;
