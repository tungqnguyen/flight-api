const path = require('path');
const express = require('express');

const app = express();
const port = 3000;
const viewsPath = path.join(__dirname, '../views');
const flightQuery = require('../flight-query/src');

app.use(express.json());
app.set('views', viewsPath);

app.get('/', async (req, res) => {
  const { url } = req.query;
  res.sendFile(path.join(`${viewsPath}/index.html`));
});
// For an airport code, return information about the airport
app.get('/airport/:code/', async (req, res) => {
  const { code } = req.params;
  try {
    const data = await flightQuery.findAirportInfo(code);
    // console.log('data from api', data);
  } catch (error) {
    console.log('error', error);
  }
});

app.get('/airport/:code/flights', async (req, res) => {
  console.log('hello', req.params);
});
// For a given Longitude/Latitude, show the closest airport
app.get('/search/airport', async (req, res) => {
  const {
    lat, lon, iso_country = null, type = null,
  } = req.query;
  console.log('/search/airport', lat, lon, type, iso_country);
  const data = await flightQuery.findClosetAirport(lat, lon, type, iso_country);
  console.log('data from api', data);
});
// For a flight number, supply information about the route
app.get('/flight/:code', async (req, res) => {
  console.log('code/', req.params);
  const { code: flightNo } = req.params;
  const data = await flightQuery.findFlightRoute(flightNo);
  console.log('route found', data);
});
// For a flight number, return the route as GeoJSON format;
app.get('/flight/:code/route.geojson', async (req, res) => {
  console.log('code/route.geojson', req.params);
  const { code: flightNo } = req.params;
  const data = await flightQuery.findFlightRouteGeoJson(flightNo);
  console.log('geoJson route', data.coordinates);
});
app.get('/flight/:code/live.geojson', async (req, res) => {
  // const url = req.query.url
  console.log('hello flight', req.params);
});
// For a series of supplied airport codes, return a route between these points
app.get('/search/flight/route/', async (req, res) => {
  // console.log('/search/flight/route', req.query);
  let airportArr = [];
  airportArr = req.query.airports.split(',');
  const data = await flightQuery.findAirportsRoute(airportArr);
  console.log('data for airports route', data);
});


app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
