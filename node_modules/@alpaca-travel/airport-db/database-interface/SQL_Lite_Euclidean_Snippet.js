const sqlite3 = require('sqlite3').verbose();
const path = require('path');
let db = new sqlite3.Database(path.join(__dirname,'../databases/aviation.db'));
let dir = path.join(__dirname,'../databases/math_64');
db.loadExtension(dir,(err) => { if (err != null) console.log('err',err) });
const longitude = 144.96332, latitude = -37.814;

// Create a query for the closest
const distance = `(6371 * acos(cos(radians($latitude)) * cos(radians(latitude)) * cos(radians(longitude) - radians($longitude)) + sin(radians($latitude)) * sin(radians(latitude))))`;
// const sql = `SELECT name, icao_code, iata_code, longitude, latitude, ${distance} AS distance FROM airport GROUP BY name, icao_code, iata_code, longitude, latitude, distance ORDER BY distance LIMIT 1;`
const sql = `SELECT name, icao_code, iata_code, latitude, longitude, (6371 * acos(cos(radians($latitude)) * cos(radians(latitude)) * cos(radians(longitude) - radians($longitude)) + sin(radians($latitude)) * sin(radians(latitude)))) AS distance FROM airport GROUP BY name, icao_code, iata_code, longitude, latitude, distance ORDER BY distance LIMIT 3;`

db.all(sql,{$latitude: latitude, $longitude: longitude}, (error, rows) => {
    console.log('closet airport(s)', rows); 
    if(error != null)console.log('err', error)
});
