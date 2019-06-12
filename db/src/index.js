const airportDb = require('../database-interface/airport-db');

const databases = [airportDb];

const getCodeInfo = async (code, type) => {
  let result = [];
  const records = await Promise.all(databases.map(db => db.getDataByCode(code, type)));
  records.map((collection) => {
    result = result.concat(collection);
  });
  return result;
};

const findClosetAirport = async (lat, lon, type, isoCountry) => {
  const result = await airportDb.getClosetAirport(lat, lon, type, isoCountry);
  return result;
};

exports.getCodeInfo = getCodeInfo;
exports.findClosetAirport = findClosetAirport;
