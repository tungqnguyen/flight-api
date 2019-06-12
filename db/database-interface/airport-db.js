const parse = require('csv-parse');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const airportDb = {

    async dbInit() {
        console.log('initialize database');
        // let db = new sqlite3.Database('../databases/aviation.db');
        let db = new sqlite3.Database(path.join(__dirname,'../databases/aviation.db'));

        db.run('DROP TABLE IF EXISTS airport');
        try {
            const response = await axios.get('http://ourairports.com/data/airports.csv');
            parse(response.data, function(err, records) {
                const cols = airportDb.createColumns(records[0]);
                const sql = `CREATE TABLE IF NOT EXISTS airport ( ${cols} )`;
                let placeholders = records[0].map((value) => '?').join(',');
                db.serialize(function () {
                    db.run(sql);
                    db.run('BEGIN')
                    let stmt = db.prepare(`INSERT INTO airport VALUES ( ${placeholders} )`);
                    for (let i = 1; i < records.length; i++) {
                        stmt.run(records[i]);
                    }
                    stmt.finalize();
                    db.run('COMMIT');
                });
                db.close();
                console.log('done');
            })
        } catch (error) {
            console.log('error', error);
        }
    },
    createColumns(array) {
        let columns = '';
        array.map(element => {
            if (element == "ident") {
                columns =  columns + "icao_code VARCHAR, ";
            }
            else if (element =="latitude_deg") {
                columns = columns + "latitude DECIMAL(10, 8) NOT NULL, ";
            }
            else if (element =="longitude_deg") {
                columns = columns + "longitude DECIMAL(11, 8) NOT NULL, ";
            }
            else {
                columns += `${element} VARCHAR, `;
            }
        })
        let result = columns.trimRight().slice(0,columns.length - 2);
        return result;
    },
    getDataByCode(code, type) {
        return new Promise(function(resolve, reject){
            if(type.includes('airport')) {
                //open db
                let db = new sqlite3.Database(path.join(__dirname,'../databases/aviation.db'));
                console.log('run');
                //get data
                let sql = `SELECT * FROM airport WHERE icao_code = ? OR iata_code = ?;`
                db.all(sql,[code,code], (err, rows) => {
                    // console.log('row', rows);
                    debugger;
                    return resolve(rows);
                });
            }
            else {
                return reject();
            }
        })
    },
    getClosetAirport(latitude, longitude, type, iso_country) {
        //type check
        return new Promise(function(resolve, reject) {
            const airportType = ['heliport', 'closed', 'small_airport', 'medium_airport', 'large_airport', 'seaplane_base'];
            if(Number(latitude) == NaN || Number(longitude) == NaN) {
                return reject('Please enter a valid lat lon');
            }
            const db = new sqlite3.Database(path.join(__dirname,'../databases/aviation.db'));
            const dir = path.join(__dirname,'../databases/math_64');
            db.loadExtension(dir,(err) => { if (err != null) console.log('err',err) });
            // Create a query for the closest
            const distance = `(6371 * acos(cos(radians($latitude)) * cos(radians(latitude)) * cos(radians(longitude) - radians($longitude)) + sin(radians($latitude)) * sin(radians(latitude))))`;
            let sql = `SELECT name, icao_code, iata_code, latitude, longitude, ${distance} AS distance FROM airport GROUP BY name, icao_code, iata_code, latitude, longitude, distance ORDER BY distance LIMIT 3;`
            let params = {$latitude: latitude, $longitude: longitude};
            if(iso_country != null && type == null) {
                sql = `SELECT name, icao_code, iata_code, latitude, longitude, iso_country, ${distance} AS distance FROM airport WHERE iso_country = $iso_country GROUP BY name, icao_code, iata_code, latitude, longitude, iso_country, distance ORDER BY distance LIMIT 3;`
                params.$iso_country = iso_country
            }
            else if (type != null && iso_country == null) {
                sql = `SELECT name, icao_code, iata_code, latitude, longitude, type, ${distance} AS distance FROM airport WHERE type = $type GROUP BY name, icao_code, iata_code, latitude, longitude, type, distance ORDER BY distance LIMIT 3;`
                params.$type = type;
            }
            else if (type !=null && iso_country !=null) {
                sql = `SELECT name, icao_code, iata_code, latitude, longitude, iso_country, type, ${distance} AS distance FROM airport WHERE type = $type AND iso_country = $iso_country GROUP BY name, icao_code, iata_code, latitude, longitude, iso_country, type, distance ORDER BY distance LIMIT 3;`
                params.$iso_country = iso_country;
                params.$type = type;
            }
            db.all(sql,params, (error, rows) => {
                if(error != null){
                    console.log('err', error);
                    return reject(error); 
                }
                else {
                    return resolve(rows);
                }
            });
        })
    }
}
module.exports = airportDb;

// airportDb.dbInit();
// airportDb.getClosetAirport(-37.8034129, 144.9986108,'wtf','US').then((val) => {console.log('cmon', val)}).catch((error)=>{console.log('not f', error)});