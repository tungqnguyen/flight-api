/* eslint-disable no-undef */
const request = require('supertest');
const nock = require('nock');
const app = require('../../src/app');
const testData = require('../data/airport_departures');
const globals = require('../../flight-query/global');

const KEY = globals.key;
const URL = 'http://aviation-edge.com';

// run express and redis server before testing

// //airport/CODE
describe('Retrieve airport info', () => {
  test('give a valid aiport iata code', async () => {
    const response = await request(app).get('/airport/PEK');
    expect(JSON.parse(response.res.text)).toEqual({
      $ref: '//airport/PEK', message: 'OK', position: [116.58499908447266, 40.080101013183594], name: 'Beijing Capital International Airport', attributes: [{ attribute: { $ref: '://airport/attribute/id', name: 'id' }, value: '27188' }, { attribute: { $ref: '://airport/attribute/icao_code', name: 'icao_code' }, value: 'ZBAA' }, { attribute: { $ref: '://airport/attribute/type', name: 'type' }, value: 'large_airport' }, { attribute: { $ref: '://airport/attribute/elevation_ft', name: 'elevation_ft' }, value: '116' }, { attribute: { $ref: '://airport/attribute/continent', name: 'continent' }, value: 'AS' }, { attribute: { $ref: '://airport/attribute/iso_country', name: 'iso_country' }, value: 'CN' }, { attribute: { $ref: '://airport/attribute/iso_region', name: 'iso_region' }, value: 'CN-11' }, { attribute: { $ref: '://airport/attribute/municipality', name: 'municipality' }, value: 'Beijing' }, { attribute: { $ref: '://airport/attribute/scheduled_service', name: 'scheduled_service' }, value: 'yes' }, { attribute: { $ref: '://airport/attribute/gps_code', name: 'gps_code' }, value: 'ZBAA' }, { attribute: { $ref: '://airport/attribute/iata_code', name: 'iata_code' }, value: 'PEK' }, { attribute: { $ref: '://airport/attribute/local_code', name: 'local_code' }, value: '' }, { attribute: { $ref: '://airport/attribute/home_link', name: 'home_link' }, value: 'http://en.bcia.com.cn/' }, { attribute: { $ref: '://airport/attribute/wikipedia_link', name: 'wikipedia_link' }, value: 'http://en.wikipedia.org/wiki/Beijing_Capital_International_Airport' }, { attribute: { $ref: '://airport/attribute/keywords', name: 'keywords' }, value: 'BJS, Bejing, Peking, Olympics' }],
    });
  });
  test('give a valid aiport icao code', async () => {
    const response = await request(app).get('/airport/VVTS');
    expect(JSON.parse(response.res.text)).toEqual({
      $ref: '//airport/VVTS', message: 'OK', position: [106.652000427, 10.8187999725], name: 'Tan Son Nhat International Airport', attributes: [{ attribute: { $ref: '://airport/attribute/id', name: 'id' }, value: '26708' }, { attribute: { $ref: '://airport/attribute/icao_code', name: 'icao_code' }, value: 'VVTS' }, { attribute: { $ref: '://airport/attribute/type', name: 'type' }, value: 'large_airport' }, { attribute: { $ref: '://airport/attribute/elevation_ft', name: 'elevation_ft' }, value: '33' }, { attribute: { $ref: '://airport/attribute/continent', name: 'continent' }, value: 'AS' }, { attribute: { $ref: '://airport/attribute/iso_country', name: 'iso_country' }, value: 'VN' }, { attribute: { $ref: '://airport/attribute/iso_region', name: 'iso_region' }, value: 'VN-23' }, { attribute: { $ref: '://airport/attribute/municipality', name: 'municipality' }, value: 'Ho Chi Minh City' }, { attribute: { $ref: '://airport/attribute/scheduled_service', name: 'scheduled_service' }, value: 'yes' }, { attribute: { $ref: '://airport/attribute/gps_code', name: 'gps_code' }, value: 'VVTS' }, { attribute: { $ref: '://airport/attribute/iata_code', name: 'iata_code' }, value: 'SGN' }, { attribute: { $ref: '://airport/attribute/local_code', name: 'local_code' }, value: '' }, { attribute: { $ref: '://airport/attribute/home_link', name: 'home_link' }, value: 'http://www.tsnairport.hochiminhcity.gov.vn/' }, { attribute: { $ref: '://airport/attribute/wikipedia_link', name: 'wikipedia_link' }, value: 'http://en.wikipedia.org/wiki/Tan_Son_Nhat_International_Airport' }, { attribute: { $ref: '://airport/attribute/keywords', name: 'keywords' }, value: 'Tansonnhat, Sài Gòn, Saigon, Sân bay Quốc tế Tân Sơn Nhất' }],
    });
  });
  test('give an invalid aiport iata/icao code', async () => {
    const response = await request(app).get('/airport/00AAAA');
    expect(JSON.parse(response.res.text)).toEqual({
      $ref: '//airport/00AAAA',
      message: 'No record found',
    });
  });
});

// flight/CODE, flight/CODE/route.geojson
describe('Retrieve route information from today\'s flight number', () => {
  test('give valid flight number', async () => {
    // const data = await flightQuery.findFlightRoute('LAN530');
    const response = await request(app).get('/flight/LAN530');
    expect(JSON.parse(response.res.text)).toEqual({
      $ref: '://flight/LAN530',
      result: {
        iata: 'LA530', icao: 'LAN530', airlineIata: 'LA', airlineIcao: 'LAN', stops: [{ ref: '://airport/SCL', iataCode: 'SCL', icaoCode: 'SCL' }, { ref: '://airport/LIM', iataCode: 'LIM', icaoCode: 'LIM' }],
      },
    });
  });
  test('give invalid flight number', async () => {
    const response = await request(app).get('/flight/SKS');
    expect(JSON.parse(response.res.text)).toEqual({ $ref: '://flight/SKS', message: 'No record found' });
  });
  test('give valid flight number and return GeoJSON format', async () => {
    const response = await request(app).get('/flight/LAN530/route.geojson');
    expect(JSON.parse(response.res.text)).toEqual({
      $ref: '//flight/LAN530/route.geojson',
      message: 'OK',
      result: {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [-70.78579711914062, -33.393001556396484] },
          properties: {
            ref: '//airport/SCEL', category: 'airport', id: '6015', icao_code: 'SCEL', type: 'large_airport', name: 'Comodoro Arturo Merino Benítez International Airport', elevation_ft: '1555', continent: 'SA', iso_country: 'CL', iso_region: 'CL-RM', municipality: 'Santiago', scheduled_service: 'yes', gps_code: 'SCEL', iata_code: 'SCL', local_code: '',
          },
        }, {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [-77.114305, -12.0219] },
          properties: {
            ref: '//airport/SPIM', category: 'airport', id: '6217', icao_code: 'SPIM', type: 'large_airport', name: 'Jorge Chávez International Airport', elevation_ft: '113', continent: 'SA', iso_country: 'PE', iso_region: 'PE-LIM', municipality: 'Lima', scheduled_service: 'yes', gps_code: 'SPJC', iata_code: 'LIM', local_code: '',
          },
        }, { type: 'Feature', geometry: { type: 'LineString', coordinates: [[-70.78579711914062, -33.393001556396484], [-77.114305, -12.0219]] }, properties: { flightNum: 'LAN530', route: ['SCL', 'LIM'] } }],
      },
    });
  });
  test('give an invalid flight number and return empty object', async () => {
    const response = await request(app).get('/flight/CM27655/route.geojson');
    expect(JSON.parse(response.res.text)).toEqual({
      $ref: '//flight/CM27655/route.geojson',
      message: 'No record found',
    });
  });
});

// //search/airport/?lat=&lon=
describe('Show nearby airports on given lat/lon', () => {
  test('give valid lat/lon pair', async () => {
    const response = await request(app).get('/search/airport/?lat=-37.8034129&lon=144.9997052');
    expect(JSON.parse(response.res.text)).toEqual({
      $ref: '//search/airport/?lat=-37.8034129&lon=144.9997052',
      message: 'OK',
      result: [{
        ref: '//airport/YRMH', name: 'Royal Melbourne Hospital Helipad', icao_code: 'YRMH', iata_code: '', latitude: -37.799243, longitude: 144.95593, iso_country: 'AU', type: 'heliport', distance: 3.873922320846621,
      }, {
        ref: '//airport/YYBK', name: 'Yarra Bank Heliport', icao_code: 'YYBK', iata_code: '', latitude: -37.822287, longitude: 144.956792, iso_country: 'AU', type: 'heliport', distance: 4.314577281723933,
      }, {
        ref: '//airport/YRHO', name: 'Royal Childrens Hospital Helipad', icao_code: 'YRHO', iata_code: '', latitude: -37.794058, longitude: 144.951309, iso_country: 'AU', type: 'heliport', distance: 4.377607450520195,
      }],
    });
  });
  test('give invalid lat/lon pair', async () => {
    const response = await request(app).get('/search/airport/?lat=-37.8034129d&lon=144.9997052fd');
    expect(JSON.parse(response.res.text)).toEqual({ $ref: '//search/airport/?lat=-37.8034129d&lon=144.9997052fd', message: 'Please enter a valid lat lon' });
  });
  test('filtered by type', async () => {
    const response = await request(app).get('/search/airport/?lat=-37.8034129&lon=144.9997052&type=small_airport');
    expect(JSON.parse(response.res.text)).toEqual({
      $ref: '//search/airport/?lat=-37.8034129&lon=144.9997052&type=small_airport',
      message: 'OK',
      result: [{
        ref: '//airport/YMPC', name: 'RAAF Williams, Point Cook Base', icao_code: 'YMPC', iata_code: '', latitude: -37.932201, longitude: 144.753006, iso_country: 'AU', type: 'small_airport', distance: 25.962161953830623,
      }, {
        ref: '//airport/YLIL', name: 'Lilydale Airport', icao_code: 'YLIL', iata_code: '', latitude: -37.69169998168945, longitude: 145.36700439453125, iso_country: 'AU', type: 'small_airport', distance: 34.60087620462142,
      }, {
        ref: '//airport/YCEM', name: 'Coldstream Airport', icao_code: 'YCEM', iata_code: '', latitude: -37.72766876220703, longitude: 145.4083709716797, iso_country: 'AU', type: 'small_airport', distance: 36.89672514489765,
      }],
    });
  });
  test('filtered by isoCountry', async () => {
    const response = await request(app).get('/search/airport/?lat=-37.8034129&lon=144.9997052&isoCountry=VN');
    expect(JSON.parse(response.res.text)).toEqual({
      $ref: '//search/airport/?lat=-37.8034129&lon=144.9997052&isoCountry=VN',
      message: 'OK',
      result: [{
        ref: '//airport/VN-0009', name: "Pearson Reef 'B' Helipad", icao_code: 'VN-0009', iata_code: '', latitude: 8.959083, longitude: 113.653409, iso_country: 'VN', type: 'heliport', distance: 6134.926665709097,
      }, {
        ref: '//airport/VN-0005', name: 'Truong Sa Airport', icao_code: 'VN-0005', iata_code: '', latitude: 8.644541, longitude: 111.920347, iso_country: 'VN', type: 'small_airport', distance: 6202.222101508816,
      }, {
        ref: '//airport/VN-0007', name: 'West London Reef Helipad', icao_code: 'VN-0007', iata_code: '', latitude: 8.845476, longitude: 112.195874, iso_country: 'VN', type: 'heliport', distance: 6205.581345286226,
      }],
    });
  });
  test('filtered by invalid type', async () => {
    const response = await request(app).get('/search/airport/?lat=-37.8034129&lon=144.9997052&type=massive_airport');
    expect(JSON.parse(response.res.text)).toEqual({ $ref: '//search/airport/?lat=-37.8034129&lon=144.9997052&type=massive_airport', message: 'No record found' });
  });
  test('filtered by invalid isoCountry', async () => {
    const response = await request(app).get('/search/airport/?lat=-37.8034129&lon=144.9997052&isoCountry=NN');
    expect(JSON.parse(response.res.text)).toEqual({ $ref: '//search/airport/?lat=-37.8034129&lon=144.9997052&isoCountry=NN', message: 'No record found' });
  });
  test('filtered by type and isoCountry ', async () => {
    const response = await request(app).get('/search/airport/?lat=-37.8034129&lon=144.9997052&isoCountry=TH&type=large_airport');
    expect(JSON.parse(response.res.text)).toEqual({
      $ref: '//search/airport/?lat=-37.8034129&lon=144.9997052&isoCountry=TH&type=large_airport',
      message: 'OK',
      result: [{
        ref: '//airport/VTSP', name: 'Phuket International Airport', icao_code: 'VTSP', iata_code: 'HKT', latitude: 8.1132, longitude: 98.316902, iso_country: 'TH', type: 'large_airport', distance: 7032.930640012764,
      }, {
        ref: '//airport/VTBS', name: 'Suvarnabhumi Airport', icao_code: 'VTBS', iata_code: 'BKK', latitude: 13.681099891662598, longitude: 100.74700164794922, iso_country: 'TH', type: 'large_airport', distance: 7351.628321373397,
      }, {
        ref: '//airport/VTBD', name: 'Don Mueang International Airport', icao_code: 'VTBD', iata_code: 'DMK', latitude: 13.9125995636, longitude: 100.607002258, iso_country: 'TH', type: 'large_airport', distance: 7381.279016328488,
      }],
    });
  });
  test('give invalid type and isoCountry', async () => {
    const response = await request(app).get('/search/airport/?lat=-37.8034129&lon=144.9997052&isoCountry=CTT&type=extra_large_airport');
    expect(JSON.parse(response.res.text)).toEqual({ $ref: '//search/airport/?lat=-37.8034129&lon=144.9997052&isoCountry=CTT&type=extra_large_airport', message: 'No record found' });
  });
});

// search/flight/route?airports=x,y,z
describe('Return GeoJSON object for a series of airport codes', () => {
  test('give valid airport codes', async () => {
    const response = await request(app).get('/search/flight/route?airports=MEL,SYD,PEK');
    expect(JSON.parse(response.res.text)).toEqual({
      $ref: '://search/flight/route?airports=MEL,SYD,PEK',
      result: {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [144.843002, -37.673302] },
          properties: {
            ref: '//airport/YMML', id: '27066', icao_code: 'YMML', type: 'large_airport', name: 'Melbourne International Airport', elevation_ft: '434', continent: 'OC', iso_country: 'AU', iso_region: 'AU-VIC', municipality: 'Melbourne', scheduled_service: 'yes', gps_code: 'YMML', iata_code: 'MEL', local_code: '',
          },
        }, {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [151.177001953125, -33.94609832763672] },
          properties: {
            ref: '//airport/YSSY', id: '27145', icao_code: 'YSSY', type: 'large_airport', name: 'Sydney Kingsford Smith International Airport', elevation_ft: '21', continent: 'OC', iso_country: 'AU', iso_region: 'AU-NSW', municipality: 'Sydney', scheduled_service: 'yes', gps_code: 'YSSY', iata_code: 'SYD', local_code: '',
          },
        }, {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [116.58499908447266, 40.080101013183594] },
          properties: {
            ref: '//airport/ZBAA', id: '27188', icao_code: 'ZBAA', type: 'large_airport', name: 'Beijing Capital International Airport', elevation_ft: '116', continent: 'AS', iso_country: 'CN', iso_region: 'CN-11', municipality: 'Beijing', scheduled_service: 'yes', gps_code: 'ZBAA', iata_code: 'PEK', local_code: '',
          },
        }, { type: 'Feature', geometry: { type: 'LineString', coordinates: [[144.843002, -37.673302], [151.177001953125, -33.94609832763672], [116.58499908447266, 40.080101013183594]] }, properties: { route: ['MEL', 'SYD', 'PEK'] } }],
      },
    });
  });
  test('give invalid airport codes', async () => {
    const response = await request(app).get('/search/flight/route?airports=MEL,SYD,PEKNN');
    expect(JSON.parse(response.res.text)).toEqual({
      $ref: '://search/flight/route?airports=MEL,SYD,PEKNN',
      message: 'No route found',
    });
  });
  test('give only one airport code', async () => {
    const response = await request(app).get('/search/flight/route?airports=MEL');
    expect(JSON.parse(response.res.text)).toEqual({ $ref: '://search/flight/route?airports=MEL', message: 'Please enter a series of airport codes' });
  });
});

// airport/CODE/flights/TYPE
describe('Given airport code, look up all flights', () => {
  test('give airport code', async () => {
    nock(URL)
      .get(`/v2/public/timetable?key=${KEY}&iataCode=SGN&type=departure`)
      .reply(200, testData.allFlights);
    const response = await request(app).get('/airport/SGN/flights/departure');
    expect(JSON.parse(response.res.text)).toEqual(testData.paginatedDepartureFlightsRes);
  });
  test('give invalid airport codes', async () => {
    nock(URL)
      .get(`/v2/public/timetable?key=${KEY}&iataCode=VATT&type=departure`)
      .reply(200, { error: { text: 'No Record Found' } });
    const response = await request(app).get('/airport/VATT/flights/departure');
    expect(JSON.parse(response.res.text)).toEqual({ $ref: '//airport/VATT/flights/departure', message: 'No record found' });
  });
  test('filtered by airline', async () => {
    nock(URL)
      .get(`/v2/public/timetable?key=${KEY}&iataCode=SGN&type=departure`)
      .reply(200, testData.allFlights);
    const response = await request(app).get('/airport/SGN/flights/departure/?airline=VJ');
    expect(JSON.parse(response.res.text)).toEqual(testData.filteredByAirlineRes);
  });
  test('filtered by invalid airline', async () => {
    nock(URL)
      .get(`/v2/public/timetable?key=${KEY}&iataCode=SGN&type=departure`)
      .reply(200, testData.allFlights);
    const response = await request(app).get('/airport/SGN/flights/departure/?airline=VJEE');
    expect(JSON.parse(response.res.text)).toEqual({ $ref: '//airport/SGN/flights/departure/?airline=VJEE', message: 'No record found' });
  });
  test('filtered by destCountry', async () => {
    nock(URL)
      .get(`/v2/public/timetable?key=${KEY}&iataCode=SGN&type=departure`)
      .reply(200, testData.allFlights);
    const response = await request(app).get('/airport/SGN/flights/departure/?destCountry=CN');
    expect(JSON.parse(response.res.text)).toEqual(testData.filteredByCountryRes);
  });
  test('filtered by invalid destCountry', async () => {
    nock(URL)
      .get(`/v2/public/timetable?key=${KEY}&iataCode=SGN&type=departure`)
      .reply(200, testData.allFlights);
    const response = await request(app).get('/airport/SGN/flights/departure/?destCountry=CNN');
    expect(JSON.parse(response.res.text)).toEqual({ $ref: '//airport/SGN/flights/departure/?destCountry=CNN', message: 'No record found' });
  });
});

// flight/CODE/live.geojson
describe('Given flight number, return live location', () => {
  test('give on air flight number', async () => {
    nock(URL)
      .get(`/v2/public/flights?key=${KEY}&flightIata=IB6841`)
      .reply(200, testData.liveFlights);
    const response = await request(app).get('/flight/IB6841/live.geojson');
    expect(JSON.parse(response.res.text)).toEqual({
      $ref: '//flight/IB6841/live.geojson',
      message: 'OK',
      result: {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [-3.56264, 40.471926] },
          properties: {
            ref: '//airport/MAD', category: 'airport', iataCode: 'MAD', icaoCode: 'MAD', type: 'large_airport', name: 'Adolfo Suárez Madrid–Barajas Airport', elevation_ft: '1998', continent: 'EU', iso_country: 'ES', iso_region: 'ES-M', municipality: 'Madrid', scheduled_service: 'yes', gps_code: 'LEMD', local_code: '',
          },
        }, {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [-58.5358, -34.8222] },
          properties: {
            ref: '//airport/EZE', category: 'airport', iataCode: 'EZE', icaoCode: 'EZE', type: 'large_airport', name: 'Ministro Pistarini International Airport', elevation_ft: '67', continent: 'SA', iso_country: 'AR', iso_region: 'AR-B', municipality: 'Buenos Aires', scheduled_service: 'yes', gps_code: 'SAEZ', local_code: 'EZE',
          },
        }, {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [-14.6707, 27.5138] },
          properties: {
            category: 'airplane', speedHorizontal: 887.108, speedIsGround: 0, speedVertical: 0, aircraftRegNumber: 'ECNBE', aircraftIcaoCode: 'A359', aircraftIcao24: '346146', aircraftIataCode: 'A359', airlineIataCode: 'IB', airlineIcaoCode: 'IBE', flightIataNumber: 'IB6841', flightIcaoNumber: 'IBE6841', flightNumber: '6841', systemUpdated: '1561595967', systemSquawk: '0',
          },
        }, { type: 'Feature', geometry: { type: 'LineString', coordinates: [[-3.56264, 40.471926], [-58.5358, -34.8222]] } }],
      },
    });
  });
  test('flight number that does not exist in database or incorrect', async () => {
    nock(URL)
      .get(`/v2/public/flights?key=${KEY}&flightIata=B610111`)
      .reply(200, { error: 'No Record Found or Flight not currently detected by receivers. ' });
    const response = await request(app).get('/flight/B610111/live.geojson');
    expect(JSON.parse(response.res.text)).toEqual({ $ref: '//flight/B610111/live.geojson', message: 'No Record Found or Flight not currently detected by receivers. ' });
  });
});
