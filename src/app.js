const path = require('path');
const express = require('express');

const app = express();
const port = 3000;
const viewsPath = path.join(__dirname, '../views');
const airportDb = require('@alpaca-travel/airport-db');

app.use(express.json());
app.set('views', viewsPath);

app.get('/', async (req, res) => {
  const { url } = req.query;
  res.sendFile(path.join(`${viewsPath}/index.html`));
});

app.get('/airport/:code/', async (req, res) => {
  const { code } = req.params;
  try {
    const data = await airportDb.getCodeInfo(code, 'airport');
    // console.log('data from api', data);
  } catch (error) {
    console.log('error', error);
  }
});

app.get('/airport/:CODE/flights', async (req, res) => {
  console.log('hello', req.params);
});

app.get('/search/airport/', async (req, res) => {
  const {
    lat, lon, iso_country = null, type = null,
  } = req.query;
  console.log('/search/airport', lat, lon, type, iso_country);
  const data = await airportDb.findClosetAirport(lat, lon, type, iso_country);
  console.log('data from api', data);
});

app.get('/flight/:CODE/', async (req, res) => {
  // const url = req.query.url
  console.log('hello code', req.params);
});
app.get('/flight/:CODE/route.geojson', async (req, res) => {
  // const url = req.query.url
  console.log('hello flight', req.params);
});
app.get('/flight/:CODE/live.geojson', async (req, res) => {
  // const url = req.query.url
  console.log('hello flight', req.params);
});


app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
