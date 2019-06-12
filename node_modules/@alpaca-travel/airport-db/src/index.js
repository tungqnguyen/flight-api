const airportDb = require('../database-interface/airport-db');
const databases = [airportDb];

const getCodeInfo = async (code, type) => {
    let result = [];
    let records = await Promise.all(databases.map(db => db.getDataByCode(code, type)) );
    records.map((collection) => {
        result = result.concat(collection);
    })
    return result;
}

const findClosetAirport = async (lat, lon, type, iso_country) => {
    let result = await airportDb.getClosetAirport(lat, lon, type, iso_country);
    return result;
}

exports.getCodeInfo = getCodeInfo;
exports.findClosetAirport = findClosetAirport;