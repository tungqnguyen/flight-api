const aviationDb = require('../database/aviation-db');

const database = [aviationDb];

const findAirportInfo = async (code, type) => {
  let result = [];
  const records = await Promise.all(database.map(db => db.getAirportInfo(code)));
  records.map((collection) => {
    result = result.concat(collection);
  });
  return result;
};

const findClosetAirport = async (lat, lon, type, isoCountry) => {
  const result = await aviationDb.getClosetAirport(lat, lon, type, isoCountry);
  return result;
};

const findAirportsRoute = async (airportCodes) => {
  const result = await aviationDb.getAirportsRoute(airportCodes);
  return result;
};

const findFlightRoute = async (flightNo) => {
  const result = await aviationDb.getFlightRoute(flightNo);
  return result;
};
const findFlightRouteGeoJson = async (flightNo) => {
  const result = await aviationDb.getFlightRouteGeoJson(flightNo);
  return result;
};
exports.findAirportInfo = findAirportInfo;
exports.findClosetAirport = findClosetAirport;
exports.findAirportsRoute = findAirportsRoute;
exports.findFlightRoute = findFlightRoute;
exports.findFlightRouteGeoJson = findFlightRouteGeoJson;
