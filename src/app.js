const path = require('path');
const express = require('express');

const app = express();
const port = 3000;
const viewsPath = path.join(__dirname, '../views');
const aviationDb = require('@alpaca-travel/aviation-db');

app.use(express.json());
app.set('views', viewsPath);

app.get('/', async (req, res) => {
  const { url } = req.query;
  res.sendFile(path.join(`${viewsPath}/index.html`));
});

app.get('/airport/:code/', async (req, res) => {
  const { code } = req.params;
  try {
    const data = await aviationDb.getCodeInfo(code, 'airport');
    // console.log('data from api', data);
  } catch (error) {
    console.log('error', error);
  }
});

app.get('/airport/:code/flights', async (req, res) => {
  console.log('hello', req.params);
});

app.get('/search/airport', async (req, res) => {
  const {
    lat, lon, iso_country = null, type = null,
  } = req.query;
  console.log('/search/airport', lat, lon, type, iso_country);
  const data = await aviationDb.findClosetAirport(lat, lon, type, iso_country);
  console.log('data from api', data);
});

app.get('/flight/:code', async (req, res) => {
  console.log('code/', req.params);
  const { code: flightNo } = req.params;
  const data = await aviationDb.findFlightRoute(flightNo);
  console.log('route found', data);
});
app.get('/flight/:code/route.geojson', async (req, res) => {
  console.log('code/route.geojson', req.params);
  const { code: flightNo } = req.params;
  const data = await aviationDb.findFlightRouteGeoJson(flightNo);
  console.log('geoJson route', data.coordinates);
});
app.get('/flight/:code/live.geojson', async (req, res) => {
  // const url = req.query.url
  console.log('hello flight', req.params);
});
app.get('/search/flight/route/', async (req, res) => {
  // console.log('/search/flight/route', req.query);
  let airportArr = [];
  airportArr = req.query.airports.split(',');
  const data = await aviationDb.findAirportsRoute(airportArr);
  console.log('data for airports route', data);
});


app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
