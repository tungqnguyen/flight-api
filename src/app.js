const express = require('express');
const flightQuery = require('../flight-query/src');
const cache = require('../middleware/cache');
const filter = require('../utility/filter');
const util = require('../utility/util');

const app = express();
app.use(express.json());

app.get('/', async (req, res) => {
  res.send('Empty endpoint');
});
// For an airport code, return information about the airport
app.get('/airport/:code/', async (req, res) => {
  const { code } = req.params;
  const data = await flightQuery.findAirportInfo(code);
  const keys = Object.keys(data);
  let response = { $ref: `://airport/${code}` };
  if (keys.length != 0) {
    response = {
      ...response,
      position: [data.longitude, data.latitude],
      name: response.name,
      attributes: [],
    };
    keys.map((key) => {
      if (key != 'latitude' && key != 'longitude' && key != 'name') {
        const ref = `://airport/attribute/${key}`;
        const attributeObj = {
          attribute: { $ref: ref, name: key },
          value: data[key],
        };
        response.attributes.push(attributeObj);
      }
    });
  } else {
    response.message = 'No record found';
  }

  res.send(response);
});
// For an airport code, look up today's flights filtered by departure/arrival
app.get('/airport/:code/flights/:type', cache.get, async (req, res, next) => {
  // otherwise perform a new request
  const {
    destCountry = null, airline = null, page = null, limit = null,
  } = req.query;
  const airportCode = req.params.code;
  const { type } = req.params;
  const options = {
    type, destCountry,
  };
  let data = null;
  console.log('locals', res.locals.cachedData);
  // if data is cached before, then return
  if (res.locals.cachedData) {
    data = res.locals.cachedData;
  } else {
    data = await flightQuery.findAirportFlights(airportCode, options);
  }
  let response = { $ref: `://airport/${airportCode}?airline=${airline}&type=${type}&destCountry=${destCountry}` };
  if (Array.isArray(data) && data.length > 0) {
    const paramsObject = util.getParams(util.getUrlFromRequest(req));
    data = filter.filterByParams(data, paramsObject);
    response = { ...response, flights: data };
  } else if (Array.isArray(data) && data.length == 0) {
    response.message = 'No record found';
  } else {
    response.message = data;
  }
  res.send(response);
  res.locals.data = data;
  next();
}, cache.set);
// For a given Longitude/Latitude, show the closest airport
app.get('/search/airport', async (req, res) => {
  const {
    lat, lon, isoCountry = null, type = null,
  } = req.query;
  let response = { $ref: `://search/airport/?lat=${lat}&lon=${lon}&isoCountry=${isoCountry}&type=${type}` };
  const data = await flightQuery.findClosetAirports(lat, lon, { type, isoCountry });
  if (Array.isArray(data) && data.length > 0) {
    response = { ...response, airports: data };
  }
  if (Array.isArray(data) && data.length == 0) {
    response.message = 'No record found';
  } else {
    response.message = data;
  }
  res.send(response);
});
// For a flight number, supply information about the route
app.get('/flight/:code', async (req, res) => {
  const { code: flightNo } = req.params;
  let response = { $ref: `://flight/${flightNo}` };
  const data = await flightQuery.findFlightRoute(flightNo);
  if (Object.keys(data).length != 0) {
    response = { ...response, route: data };
  } else {
    response.message = 'No record found';
  }
  res.send(response);
});
// For a flight number, return the route as GeoJSON format;
app.get('/flight/:code/route.geojson', async (req, res) => {
  const { code: flightNo } = req.params;
  let response = { $ref: `://flight/${flightNo}/route.geojson` };
  const data = await flightQuery.findFlightRouteGeoJson(flightNo);
  if (Object.keys(data).length != 0) {
    response = { ...response, routeGeoJSON: data };
  } else {
    response.message = 'No record found';
  }
  res.send(response);
});
// For a flight number, provide the location of the plane on the route as GeoJSON Point;
app.get('/flight/:code/live.geojson', async (req, res) => {
  const { code: iataCode } = req.params;
  let response = { $ref: `://flight/${iataCode}/live.geojson` };
  const data = await flightQuery.findFlightLocation(iataCode);
  if (typeof data === 'object' && Object.keys(data).length != 0) {
    response = { ...response, currentLocation: data };
  } else {
    response.message = data;
  }
  res.send(response);
});
// For a series of supplied airport codes, return a route between these points
app.get('/search/flight/route/', async (req, res) => {
  let airportArr = [];
  airportArr = req.query.airports.split(',');
  let response = { $ref: `://search/flight/route?airports=${req.query.airports}` };
  if (airportArr.length < 2) {
    response.message = 'Please enter a series of airport codes';
    return res.send(response);
  }
  const data = await flightQuery.findAirportsRoute(airportArr);
  if (Object.keys(data).length != 0) {
    response = { ...response, routes: data };
  } else {
    response.message = 'No record found';
  }
  res.send(response);
});


module.exports = app;
