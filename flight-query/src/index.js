const airport = require('../database/airport');
const flight = require('../database/flight');

const findAirportInfo = async (code, type) => {
  const result = await airport.getAirportInfo(code);
  return result;
};

const findClosetAirports = async (lat, lon, options) => {
  const result = await airport.getClosetAirports(lat, lon, options);
  return result;
};

const findAirportsRoute = async (airportCodes) => {
  const result = await airport.getAirportsRoute(airportCodes);
  return result;
};

const findAirportFlights = async (airportCode, options) => {
  const result = await airport.getAirportFlights(airportCode, options);
  return result;
};

const findFlightRoute = async (flightNo) => {
  const result = await flight.getFlightRoute(flightNo);
  return result;
};
const findFlightRouteGeoJson = async (flightNo) => {
  const result = await flight.getFlightRouteGeoJson(flightNo);
  return result;
};
const findFlightLocation = async (flightNo) => {
  const result = await flight.getFlightLocation(flightNo);
  return result;
};
const findAirportsByCountry = async (countryCode) => {
  const result = await airport.getAirportByCountry(countryCode);
  return result;
};

exports.findAirportInfo = findAirportInfo;
exports.findClosetAirports = findClosetAirports;
exports.findAirportsRoute = findAirportsRoute;
exports.findFlightRoute = findFlightRoute;
exports.findFlightRouteGeoJson = findFlightRouteGeoJson;
exports.findAirportFlights = findAirportFlights;
exports.findFlightLocation = findFlightLocation;
exports.findAirportsByCountry = findAirportsByCountry;
