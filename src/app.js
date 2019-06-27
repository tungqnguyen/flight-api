/* eslint-disable no-param-reassign */
const express = require('express');
const flightQuery = require('../flight-query/src');

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
  let response = { $ref: `/${req.originalUrl}`, message: 'OK' };
  if (keys.length != 0) {
    response = {
      ...response,
      position: [data.longitude, data.latitude],
      name: data.name,
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
app.get('/airport/:code/flights/:type', async (req, res) => {
  const { destCountry = null, airline = null } = req.query;
  let { page = 1, limit = 10 } = req.query;
  page = Math.max(parseInt(page, 10), 1);
  limit = Math.max(parseInt(limit, 10), 1);
  const airportCode = req.params.code;
  const { type } = req.params;
  const options = {
    type, destCountry, airline,
  };
  const data = await flightQuery.findAirportFlights(airportCode, options);
  let response = { $ref: `/${req.originalUrl}`, message: 'OK' };
  if (Array.isArray(data) && data.length > 0) {
    // pagination
    const startRecord = Math.max(parseInt(page, 10) - 1, 0) * Math.min(parseInt(limit, 10), data.length);
    const endRecord = startRecord + Math.min(parseInt(limit, 10), data.length - startRecord);
    if (endRecord == data.length) response.message = 'End of result';
    const paginatedData = data.slice(startRecord, endRecord);
    const results = paginatedData.map((element) => {
      element.flight = { ref: `//flight/${element.flight.icaoNumber}`, ...element.flight };
      // attaching airport ref
      element.stops.forEach((stop, i, stops) => {
        stops[i] = { ref: `//airport/${stop.icaoCode}`, ...stop };
      });
      return element;
    });
    response = {
      ...response,
      result: results,
      query: { destCountry, airline },
      total: data.length,
      page,
      limit: endRecord - startRecord,
    };
  } else if (Array.isArray(data) && data.length == 0) {
    response.message = 'No record found';
  } else {
    response.message = data;
  }
  res.send(response);
});
// For a given Longitude/Latitude, show the closest airport
app.get('/search/airport', async (req, res) => {
  const {
    lat, lon, isoCountry = null, type = null, limit = 3,
  } = req.query;
  let isoCountryArr = null;
  let typeArr = null;
  if (isoCountry != null) isoCountryArr = isoCountry.split(',');
  if (type != null) typeArr = type.split(',');
  let response = { $ref: `/${req.originalUrl}`, message: 'OK' };
  const data = await flightQuery.findClosetAirports(lat, lon, { typeArr, isoCountryArr, limit });
  if (Array.isArray(data) && data.length > 0) {
    const results = data.map(element => ({ ref: `//airport/${element.icao_code}`, ...element }));
    response = { ...response, result: results };
  } else if (Array.isArray(data) && data.length == 0) {
    response.message = 'No record found';
  }
  res.send(response);
});
// For a flight number, supply information about the route
app.get('/flight/:code', async (req, res) => {
  const { code: flightNo } = req.params;
  let response = { $ref: `://flight/${flightNo}` };
  const data = await flightQuery.findFlightRoute(flightNo);
  // format data
  const formatData = {
    iata: data.flight_iata,
    icao: data.flight_icao,
    airlineIata: data.airline_iata,
    airlineIcao: data.airline_icao,
    stops: [{
      ref: `://airport/${data.departure_icao}`,
      iataCode: data.departure_iata,
      icaoCode: data.departure_icao,
    },
    {
      ref: `://airport/${data.arrival_icao}`,
      iataCode: data.arrival_iata,
      icaoCode: data.arrival_icao,
    }],
  };
  if (Object.keys(data).length != 0) {
    response = { ...response, result: formatData };
  } else {
    response.message = 'No record found';
  }
  res.send(response);
});
// For a flight number, return the route as GeoJSON format;
app.get('/flight/:code/route.geojson', async (req, res) => {
  const { code: flightNo } = req.params;
  let response = { $ref: `/${req.originalUrl}`, message: 'OK' };
  // array of stops departure and arrival
  const data = await flightQuery.findFlightRouteGeoJson(flightNo);
  // if (Object.keys(data).length != 0) {
  if (Array.isArray(data) && data.length > 0) {
    const featureCollection = {
      type: 'FeatureCollection',
      features: [],
    };
    const lineString = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [],
      },
      properties: { flightNum: flightNo, route: [] },
    };
    // create Points, LineString
    data.map((stop) => {
      const feature = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [stop.longitude, stop.latitude],
        },
        properties: { ref: `//airport/${stop.icao_code}` },
      };
      lineString.geometry.coordinates.push([stop.longitude, stop.latitude]);
      lineString.properties.route.push(stop.iata_code);
      feature.properties.category = 'airport';
      Object.keys(stop).map((key) => {
        if (!['latitude', 'longitude', 'home_link', 'wikipedia_link', 'keywords'].includes(key)) {
          feature.properties[key] = stop[key];
        }
      });
      featureCollection.features.push(feature);
    });
    featureCollection.features.push(lineString);
    response = { ...response, result: featureCollection };
  } else {
    response.message = 'No record found';
  }
  res.send(response);
});
// For a flight number, provide the location of the plane on the route as GeoJSON Point;
app.get('/flight/:code/live.geojson', async (req, res) => {
  const { code: iataCode } = req.params;
  let response = { $ref: `/${req.originalUrl}`, message: 'OK' };
  const data = await flightQuery.findFlightLocation(iataCode);
  if (typeof data === 'object' && Object.keys(data).length != 0) {
    // flatten object
    const featureCollection = {
      type: 'FeatureCollection',
      features: [],
    };
    const lineString = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [],
      },
    };
    // add Points
    [data.departure, data.arrival, data.geography].map((stop, i) => {
      const feature = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [stop.longitude, stop.latitude],
        },
        // properties: { ref: `//airport/${stop.icao_code}` },
        properties: {},
      };
      // if a live location
      if (i == 2) {
        feature.properties.category = 'airplane';
        Object.keys(data).map((propObjectKey) => {
          if (!['arrival', 'departure', 'geography', 'status'].includes(propObjectKey)) {
            // prefix key
            Object.keys(data[propObjectKey]).map((key) => {
              const keyName = `${propObjectKey}${key[0].toUpperCase()}${key.slice(1)}`;
              feature.properties[keyName] = data[propObjectKey][key];
            });
          }
        });
      // if it is an airport Point
      } else {
        feature.properties.ref = `//airport/${stop.icaoCode}`;
        feature.properties.category = 'airport';
        Object.keys(stop).map((key) => {
          if (!['latitude', 'longitude', 'home_link', 'wikipedia_link', 'keywords'].includes(key)) {
            feature.properties[key] = stop[key];
          }
        });
        lineString.geometry.coordinates.push([stop.longitude, stop.latitude]);
      }
      featureCollection.features.push(feature);
    });
    featureCollection.features.push(lineString);
    const result = featureCollection;
    response = { ...response, result };
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
    const featureCollection = {
      type: 'FeatureCollection',
      features: [],
    };
    const lineString = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [],
      },
      properties: { route: [] },
    };
    data.map((stop) => {
      const feature = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [stop.longitude, stop.latitude],
        },
        properties: { ref: `//airport/${stop.icao_code}` },
      };
      lineString.geometry.coordinates.push([stop.longitude, stop.latitude]);
      lineString.properties.route.push(stop.iata_code);
      Object.keys(stop).map((key) => {
        if (!['latitude', 'longitude', 'home_link', 'wikipedia_link', 'keywords'].includes(key)) {
          feature.properties[key] = stop[key];
        }
      });
      featureCollection.features.push(feature);
    });
    featureCollection.features.push(lineString);
    response = { ...response, result: featureCollection };
  } else {
    response.message = 'No record found';
  }
  res.send(response);
});


module.exports = app;
