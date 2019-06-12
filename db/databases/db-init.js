const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const axios = require('axios');
const parse = require('csv-parse');

function createColumns(array) {
  let columns = '';
  array.map((element) => {
    if (element === 'ident') {
      columns += 'icao_code VARCHAR, ';
    } else if (element === 'latitude_deg') {
      columns += 'latitude DECIMAL(10, 8) NOT NULL, ';
    } else if (element === 'longitude_deg') {
      columns += 'longitude DECIMAL(11, 8) NOT NULL, ';
    } else {
      columns += `${element} VARCHAR, `;
    }
  });
  const result = columns.trimRight().slice(0, columns.length - 2);
  return result;
}

async function dbInit() {
  console.log('initialize database');
  const db = new sqlite3.Database(path.join(__dirname, '../databases/aviation.db'));
  db.run('DROP TABLE IF EXISTS airport');
  try {
    const response = await axios.get('http://ourairports.com/data/airports.csv');
    parse(response.data, (err, records) => {
      const cols = createColumns(records[0]);
      const sql = `CREATE TABLE IF NOT EXISTS airport ( ${cols} )`;
      const placeholders = records[0].map(value => '?').join(',');
      db.serialize(() => {
        db.run(sql);
        db.run('BEGIN');
        const stmt = db.prepare(`INSERT INTO airport VALUES ( ${placeholders} )`);
        for (let i = 1; i < records.length; i += 1) {
          stmt.run(records[i]);
        }
        stmt.finalize();
        db.run('COMMIT');
      });
      db.close();
      console.log('done');
    });
  } catch (error) {
    console.log('error', error);
  }
}


dbInit();
