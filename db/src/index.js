const aviationDb = require('../database-interface/aviation-db');

const databases = [aviationDb];

const getCodeInfo = async (code, type) => {
  let result = [];
  const records = await Promise.all(databases.map(db => db.getDataByCode(code, type)));
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
exports.getCodeInfo = getCodeInfo;
exports.findClosetAirport = findClosetAirport;
exports.findAirportsRoute = findAirportsRoute;
exports.findFlightRoute = findFlightRoute;
exports.findFlightRouteGeoJson = findFlightRouteGeoJson;
