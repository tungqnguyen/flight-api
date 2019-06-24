/* eslint-disable no-undef */
const request = require('supertest');
const nock = require('nock');
const app = require('../../src/app');
const testData = require('../data/airport_departures');
const globals = require('../../flight-query/global');

const KEY = globals.key;
const URL = 'http://aviation-edge.com';

// Remember to turn on server.js before testing
describe('Retrieve airport info', () => {
  test('give a valid aiport iata code', async () => {
    const response = await request(app).get('/airport/PEK');
    expect(JSON.parse(response.res.text)).toEqual({
      $ref: '://airport/PEK',
      position: [40.080101013183594, 116.58499908447266],
      attributes: [{ id: '27188' }, { icao_code: 'ZBAA' }, { type: 'large_airport' }, { elevation_ft: '116' }, { continent: 'AS' }, { iso_country: 'CN' }, { iso_region: 'CN-11' }, { municipality: 'Beijing' }, { scheduled_service: 'yes' }, { gps_code: 'ZBAA' }, { iata_code: 'PEK' }, { local_code: '' }, { home_link: 'http://en.bcia.com.cn/' }, { wikipedia_link: 'http://en.wikipedia.org/wiki/Beijing_Capital_International_Airport' }, { keywords: 'BJS, Bejing, Peking, Olympics' }],
    });
  });
  test('give a valid aiport icao code', async () => {
    const response = await request(app).get('/airport/VVTS');
    expect(JSON.parse(response.res.text)).toEqual({ $ref: '://airport/VVTS', position: [10.8187999725, 106.652000427], attributes: [{ id: '26708' }, { icao_code: 'VVTS' }, { type: 'large_airport' }, { elevation_ft: '33' }, { continent: 'AS' }, { iso_country: 'VN' }, { iso_region: 'VN-23' }, { municipality: 'Ho Chi Minh City' }, { scheduled_service: 'yes' }, { gps_code: 'VVTS' }, { iata_code: 'SGN' }, { local_code: '' }, { home_link: 'http://www.tsnairport.hochiminhcity.gov.vn/' }, { wikipedia_link: 'http://en.wikipedia.org/wiki/Tan_Son_Nhat_International_Airport' }, { keywords: 'Tansonnhat, Sài Gòn, Saigon, Sân bay Quốc tế Tân Sơn Nhất' }] });
  });
  test('give an invalid aiport iata/icao code', async () => {
    const response = await request(app).get('/airport/00AAAA');
    expect(JSON.parse(response.res.text)).toEqual({ $ref: '://airport/00AAAA', message: 'No record found' });
  });
});

describe('Retrieve route information from today\'s flight number', () => {
  test('give valid flight number', async () => {
    // const data = await flightQuery.findFlightRoute('LAN530');
    const response = await request(app).get('/flight/LAN530');

    expect(JSON.parse(response.res.text)).toEqual({
      $ref: '://flight/LAN530',
      route: {
        flight_iata: 'LA530',
        flight_icao: 'LAN530',
        departure_iata: 'LIM',
        arrival_iata: 'JFK',
        departure_icao: 'SPIM',
        arrival_icao: 'KJFK',
        airline_iata: 'LA',
      },
    });
  });
  test('give invalid flight number', async () => {
    const response = await request(app).get('/flight/SK26456');
    expect(JSON.parse(response.res.text)).toEqual({ $ref: '://flight/SK26456', message: 'No record found' });
  });
  test('give valid flight number and return GeoJSON format', async () => {
    const response = await request(app).get('/flight/LAN530/route.geojson');

    expect(JSON.parse(response.res.text)).toEqual({
      $ref: '://flight/LAN530/route.geojson',
      routeGeoJSON: {
        type: 'LineString',
        coordinates: [
          [
            -12.0219,
            -77.114305,
          ],
          [
            40.63980103,
            -73.77890015,
          ],
        ],
        properties: [
          {
            departureProperties: {
              id: '6217',
              icao_code: 'SPIM',
              type: 'large_airport',
              name: 'Jorge Chávez International Airport',
              latitude: -12.0219,
              longitude: -77.114305,
              elevation_ft: '113',
              continent: 'SA',
              iso_country: 'PE',
              iso_region: 'PE-LIM',
              municipality: 'Lima',
              scheduled_service: 'yes',
              gps_code: 'SPJC',
              iata_code: 'LIM',
              local_code: '',
              home_link: 'http://www.lap.com.pe/',
              wikipedia_link: 'https://en.wikipedia.org/wiki/Jorge_Ch%C3%A1vez_International_Airport',
              keywords: 'SPIM',
            },
          },
          {
            arrivalProperties: {
              id: '3622',
              icao_code: 'KJFK',
              type: 'large_airport',
              name: 'John F Kennedy International Airport',
              latitude: 40.63980103,
              longitude: -73.77890015,
              elevation_ft: '13',
              continent: 'NA',
              iso_country: 'US',
              iso_region: 'US-NY',
              municipality: 'New York',
              scheduled_service: 'yes',
              gps_code: 'KJFK',
              iata_code: 'JFK',
              local_code: 'JFK',
              home_link: 'http://www.panynj.gov/CommutingTravel/airports/html/kennedy.html',
              wikipedia_link: 'http://en.wikipedia.org/wiki/John_F._Kennedy_International_Airport',
              keywords: 'Manhattan, New York City, NYC, Idlewild',
            },
          },
        ],
      },
    });
  });
  test('give an invalid flight number and return empty object', async () => {
    const response = await request(app).get('/flight/CM27655/route.geojson');

    expect(JSON.parse(response.res.text)).toEqual({
      $ref: '://flight/CM27655/route.geojson',
      message: 'No record found',
    });
  });
});

describe('Show nearby airports on given lat/lon', () => {
  test('give valid lat/lon pair', async () => {
    const response = await request(app).get('/search/airport/?lat=-37.8034129&lon=144.9997052');

    expect(JSON.parse(response.res.text)).toEqual({
      $ref: '://search/airport/?lat=-37.8034129&lon=144.9997052&isoCountry=null&type=null',
      airports: [
        {
          name: 'Royal Melbourne Hospital Helipad',
          icao_code: 'YRMH',
          iata_code: '',
          latitude: -37.799243,
          longitude: 144.95593,
          iso_country: 'AU',
          type: 'heliport',
          distance: 3.873922320846621,
        },
        {
          name: 'Yarra Bank Heliport',
          icao_code: 'YYBK',
          iata_code: '',
          latitude: -37.822287,
          longitude: 144.956792,
          iso_country: 'AU',
          type: 'heliport',
          distance: 4.314577281723933,
        },
        {
          name: 'Royal Childrens Hospital Helipad',
          icao_code: 'YRHO',
          iata_code: '',
          latitude: -37.794058,
          longitude: 144.951309,
          iso_country: 'AU',
          type: 'heliport',
          distance: 4.377607450520195,
        },
      ],
      message: [
        {
          name: 'Royal Melbourne Hospital Helipad',
          icao_code: 'YRMH',
          iata_code: '',
          latitude: -37.799243,
          longitude: 144.95593,
          iso_country: 'AU',
          type: 'heliport',
          distance: 3.873922320846621,
        },
        {
          name: 'Yarra Bank Heliport',
          icao_code: 'YYBK',
          iata_code: '',
          latitude: -37.822287,
          longitude: 144.956792,
          iso_country: 'AU',
          type: 'heliport',
          distance: 4.314577281723933,
        },
        {
          name: 'Royal Childrens Hospital Helipad',
          icao_code: 'YRHO',
          iata_code: '',
          latitude: -37.794058,
          longitude: 144.951309,
          iso_country: 'AU',
          type: 'heliport',
          distance: 4.377607450520195,
        },
      ],
    });
  });
  test('give invalid lat/lon pair', async () => {
    const response = await request(app).get('/search/airport/?lat=-37.8034129d&lon=144.9997052fd');
    expect(JSON.parse(response.res.text)).toEqual({
      $ref: '://search/airport/?lat=-37.8034129d&lon=144.9997052fd&isoCountry=null&type=null',
      message: 'Please enter a valid lat lon',
    });
  });
  test('filtered by type', async () => {
    const response = await request(app).get('/search/airport/?lat=-37.8034129&lon=144.9997052&type=small_airport');
    expect(JSON.parse(response.res.text)).toEqual({
      $ref: '://search/airport/?lat=-37.8034129&lon=144.9997052&isoCountry=null&type=small_airport',
      airports: [
        {
          name: 'RAAF Williams, Point Cook Base',
          icao_code: 'YMPC',
          iata_code: '',
          latitude: -37.932201,
          longitude: 144.753006,
          iso_country: 'AU',
          type: 'small_airport',
          distance: 25.962161953830623,
        },
        {
          name: 'Lilydale Airport',
          icao_code: 'YLIL',
          iata_code: '',
          latitude: -37.69169998168945,
          longitude: 145.36700439453125,
          iso_country: 'AU',
          type: 'small_airport',
          distance: 34.60087620462142,
        },
        {
          name: 'Coldstream Airport',
          icao_code: 'YCEM',
          iata_code: '',
          latitude: -37.72766876220703,
          longitude: 145.4083709716797,
          iso_country: 'AU',
          type: 'small_airport',
          distance: 36.89672514489765,
        },
      ],
      message: [
        {
          name: 'RAAF Williams, Point Cook Base',
          icao_code: 'YMPC',
          iata_code: '',
          latitude: -37.932201,
          longitude: 144.753006,
          iso_country: 'AU',
          type: 'small_airport',
          distance: 25.962161953830623,
        },
        {
          name: 'Lilydale Airport',
          icao_code: 'YLIL',
          iata_code: '',
          latitude: -37.69169998168945,
          longitude: 145.36700439453125,
          iso_country: 'AU',
          type: 'small_airport',
          distance: 34.60087620462142,
        },
        {
          name: 'Coldstream Airport',
          icao_code: 'YCEM',
          iata_code: '',
          latitude: -37.72766876220703,
          longitude: 145.4083709716797,
          iso_country: 'AU',
          type: 'small_airport',
          distance: 36.89672514489765,
        },
      ],
    });
  });
  test('filtered by isoCountry', async () => {
    const response = await request(app).get('/search/airport/?lat=-37.8034129&lon=144.9997052&isoCountry=VN');
    expect(JSON.parse(response.res.text)).toEqual({
      $ref: '://search/airport/?lat=-37.8034129&lon=144.9997052&isoCountry=VN&type=null',
      airports: [
        {
          name: "Pearson Reef 'B' Helipad",
          icao_code: 'VN-0009',
          iata_code: '',
          latitude: 8.959083,
          longitude: 113.653409,
          iso_country: 'VN',
          type: 'heliport',
          distance: 6134.926665709097,
        },
        {
          name: 'Truong Sa Airport',
          icao_code: 'VN-0005',
          iata_code: '',
          latitude: 8.644541,
          longitude: 111.920347,
          iso_country: 'VN',
          type: 'small_airport',
          distance: 6202.222101508816,
        },
        {
          name: 'West London Reef Helipad',
          icao_code: 'VN-0007',
          iata_code: '',
          latitude: 8.845476,
          longitude: 112.195874,
          iso_country: 'VN',
          type: 'heliport',
          distance: 6205.581345286226,
        },
      ],
      message: [
        {
          name: "Pearson Reef 'B' Helipad",
          icao_code: 'VN-0009',
          iata_code: '',
          latitude: 8.959083,
          longitude: 113.653409,
          iso_country: 'VN',
          type: 'heliport',
          distance: 6134.926665709097,
        },
        {
          name: 'Truong Sa Airport',
          icao_code: 'VN-0005',
          iata_code: '',
          latitude: 8.644541,
          longitude: 111.920347,
          iso_country: 'VN',
          type: 'small_airport',
          distance: 6202.222101508816,
        },
        {
          name: 'West London Reef Helipad',
          icao_code: 'VN-0007',
          iata_code: '',
          latitude: 8.845476,
          longitude: 112.195874,
          iso_country: 'VN',
          type: 'heliport',
          distance: 6205.581345286226,
        },
      ],
    });
  });
  test('filtered by invalid type', async () => {
    const response = await request(app).get('/search/airport/?lat=-37.8034129&lon=144.9997052&type=massive_airport');
    expect(JSON.parse(response.res.text)).toEqual({
      $ref: '://search/airport/?lat=-37.8034129&lon=144.9997052&isoCountry=null&type=massive_airport',
      message: 'No record found',
    });
  });
  test('filtered by invalid isoCountry', async () => {
    const response = await request(app).get('/search/airport/?lat=-37.8034129&lon=144.9997052&isoCountry=NN');
    expect(JSON.parse(response.res.text)).toEqual({
      $ref: '://search/airport/?lat=-37.8034129&lon=144.9997052&isoCountry=NN&type=null',
      message: 'No record found',
    });
  });
  test('filtered by type and isoCountry ', async () => {
    const response = await request(app).get('/search/airport/?lat=-37.8034129&lon=144.9997052&isoCountry=TH&type=large_airport');
    expect(JSON.parse(response.res.text)).toEqual({
      $ref: '://search/airport/?lat=-37.8034129&lon=144.9997052&isoCountry=TH&type=large_airport',
      airports: [
        {
          name: 'Phuket International Airport',
          icao_code: 'VTSP',
          iata_code: 'HKT',
          latitude: 8.1132,
          longitude: 98.316902,
          iso_country: 'TH',
          type: 'large_airport',
          distance: 7032.930640012764,
        },
        {
          name: 'Suvarnabhumi Airport',
          icao_code: 'VTBS',
          iata_code: 'BKK',
          latitude: 13.681099891662598,
          longitude: 100.74700164794922,
          iso_country: 'TH',
          type: 'large_airport',
          distance: 7351.628321373397,
        },
        {
          name: 'Don Mueang International Airport',
          icao_code: 'VTBD',
          iata_code: 'DMK',
          latitude: 13.9125995636,
          longitude: 100.607002258,
          iso_country: 'TH',
          type: 'large_airport',
          distance: 7381.279016328488,
        },
      ],
      message: [
        {
          name: 'Phuket International Airport',
          icao_code: 'VTSP',
          iata_code: 'HKT',
          latitude: 8.1132,
          longitude: 98.316902,
          iso_country: 'TH',
          type: 'large_airport',
          distance: 7032.930640012764,
        },
        {
          name: 'Suvarnabhumi Airport',
          icao_code: 'VTBS',
          iata_code: 'BKK',
          latitude: 13.681099891662598,
          longitude: 100.74700164794922,
          iso_country: 'TH',
          type: 'large_airport',
          distance: 7351.628321373397,
        },
        {
          name: 'Don Mueang International Airport',
          icao_code: 'VTBD',
          iata_code: 'DMK',
          latitude: 13.9125995636,
          longitude: 100.607002258,
          iso_country: 'TH',
          type: 'large_airport',
          distance: 7381.279016328488,
        },
      ],
    });
  });
  test('give invalid type and isoCountry', async () => {
    const response = await request(app).get('/search/airport/?lat=-37.8034129&lon=144.9997052&isoCountry=CTT&type=extra_large_airport');
    expect(JSON.parse(response.res.text)).toEqual({
      $ref: '://search/airport/?lat=-37.8034129&lon=144.9997052&isoCountry=CTT&type=extra_large_airport',
      message: 'No record found',
    });
  });
});
describe('Return GeoJSON object for a series of airport codes', () => {
  test('give valid airport codes', async () => {
    const response = await request(app).get('/search/flight/route?airports=MEL,SYD,PEK');
    expect(JSON.parse(response.res.text)).toEqual({
      $ref: '://search/flight/route?airports=MEL,SYD,PEK',
      routes: {
        type: 'LineString',
        coordinates: [
          [
            -37.673302,
            144.843002,
          ],
          [
            -33.94609832763672,
            151.177001953125,
          ],
          [
            40.080101013183594,
            116.58499908447266,
          ],
        ],
        properties: [
          {
            point1: {
              id: '27066',
              icao_code: 'YMML',
              type: 'large_airport',
              name: 'Melbourne International Airport',
              latitude: -37.673302,
              longitude: 144.843002,
              elevation_ft: '434',
              continent: 'OC',
              iso_country: 'AU',
              iso_region: 'AU-VIC',
              municipality: 'Melbourne',
              scheduled_service: 'yes',
              gps_code: 'YMML',
              iata_code: 'MEL',
              local_code: '',
              home_link: 'http://melbourneairport.com.au/',
              wikipedia_link: 'http://en.wikipedia.org/wiki/Melbourne_Airport',
              keywords: '',
            },
          },
          {
            point2: {
              id: '27145',
              icao_code: 'YSSY',
              type: 'large_airport',
              name: 'Sydney Kingsford Smith International Airport',
              latitude: -33.94609832763672,
              longitude: 151.177001953125,
              elevation_ft: '21',
              continent: 'OC',
              iso_country: 'AU',
              iso_region: 'AU-NSW',
              municipality: 'Sydney',
              scheduled_service: 'yes',
              gps_code: 'YSSY',
              iata_code: 'SYD',
              local_code: '',
              home_link: 'http://www.sydneyairport.com.au/',
              wikipedia_link: 'http://en.wikipedia.org/wiki/Kingsford_Smith_International_Airport',
              keywords: 'RAAF Station Mascot',
            },
          },
          {
            point3: {
              id: '27188',
              icao_code: 'ZBAA',
              type: 'large_airport',
              name: 'Beijing Capital International Airport',
              latitude: 40.080101013183594,
              longitude: 116.58499908447266,
              elevation_ft: '116',
              continent: 'AS',
              iso_country: 'CN',
              iso_region: 'CN-11',
              municipality: 'Beijing',
              scheduled_service: 'yes',
              gps_code: 'ZBAA',
              iata_code: 'PEK',
              local_code: '',
              home_link: 'http://en.bcia.com.cn/',
              wikipedia_link: 'http://en.wikipedia.org/wiki/Beijing_Capital_International_Airport',
              keywords: 'BJS, Bejing, Peking, Olympics',
            },
          },
        ],
      },
    });
  });
  test('give invalid airport codes', async () => {
    const response = await request(app).get('/search/flight/route?airports=MEL,SYD,PEKNN');
    expect(JSON.parse(response.res.text)).toEqual({
      $ref: '://search/flight/route?airports=MEL,SYD,PEKNN',
      routes: 'No route found',
    });
  });
  test('give only one airport code', async () => {
    const response = await request(app).get('/search/flight/route?airports=MEL');
    expect(JSON.parse(response.res.text)).toEqual({
      $ref: '://search/flight/route?airports=MEL',
      message: 'Please enter a series of airport codes',
    });
  });
});
describe('Given airport code, look up all flights', () => {
  test('give airport code', async () => {
    nock(URL)
      .get(`/v2/public/timetable?key=${KEY}&iataCode=SGN&type=departure`)
      .reply(200, testData.allFlights);
    const response = await request(app).get('/airport/SGN/flights');
    expect(JSON.parse(response.res.text)).toEqual({
      $ref: '://airport/SGN?airline=null&type=departure&destCountry=null',
      flights: testData.allFlights,
    });
  });
  test('give invalid airport codes', async () => {
    nock(URL)
      .get(`/v2/public/timetable?key=${KEY}&iataCode=SGNNN&type=departure`)
      .reply(200, []);
    const response = await request(app).get('/airport/SGNNN/flights');
    expect(JSON.parse(response.res.text)).toEqual({
      $ref: '://airport/SGNNN?airline=null&type=departure&destCountry=null',
      message: 'No record found',
    });
  });
  test('filtered by airline', async () => {
    nock(URL)
      .get(`/v2/public/timetable?key=${KEY}&iataCode=SGN&type=departure`)
      .reply(200, testData.allFlights);
    const response = await request(app).get('/airport/SGN/flights?airline=VJ');
    expect(JSON.parse(response.res.text)).toEqual(testData.filteredByAirlineResponseData);
  });
  test('filtered by invalid airline', async () => {
    nock(URL)
      .get(`/v2/public/timetable?key=${KEY}&iataCode=SGN&type=departure`)
      .reply(200, testData.allFlights);
    const response = await request(app).get('/airport/SGN/flights?airline=VJEE');
    expect(JSON.parse(response.res.text)).toEqual({
      $ref: '://airport/SGN?airline=VJEE&type=departure&destCountry=null',
      message: 'No record found',
    });
  });
  test('filtered by destCountry', async () => {
    nock(URL)
      .get(`/v2/public/timetable?key=${KEY}&iataCode=SGN&type=departure`)
      .reply(200, testData.allFlights);
    const response = await request(app).get('/airport/SGN/flights?destCountry=CN');
    expect(JSON.parse(response.res.text)).toEqual(testData.filteredByCountryResponseData);
  });
  test('filtered by invalid destCountry', async () => {
    nock(URL)
      .get(`/v2/public/timetable?key=${KEY}&iataCode=SGN&type=departure`)
      .reply(200, testData.allFlights);
    const response = await request(app).get('/airport/SGN/flights?destCountry=CNN');
    expect(JSON.parse(response.res.text)).toEqual({
      $ref: '://airport/SGN?airline=null&type=departure&destCountry=CNN',
      message: 'No record found',
    });
  });
});
describe('Given flight number, return live location', () => {
  test('give on air flight number', async () => {
    nock(URL)
      .get(`/v2/public/flights?key=${KEY}&flightIata=ID6262`)
      .reply(200, testData.liveFlights);
    const response = await request(app).get('/flight/ID6262/live.geojson');
    expect(JSON.parse(response.res.text)).toEqual({
      $ref: '://flight/ID6262/live.geojson',
      currentLocation:
     {
       type: 'Point',
       coordinates: [-6.25443, 113.608],
       properties: [{
         aircraft: {
           iataCode: 'CRJX',
           icao24: '8A0337',
           icaoCode: 'CRJX',
           regNumber: 'PKGRC',
         },
         airline: {
           iataCode: 'ID',
           icaoCode: 'BTK',
         },
         arrival: {
           iataCode: 'UPG',
           icaoCode: 'UPG',
         },
         departure: {
           iataCode: 'CGK',
           icaoCode: 'CGK',
         },
         flight: {
           iataNumber: 'ID6262',
           icaoNumber: 'BTK6262',
           number: '6262',
         },
         geography: {
           altitude: 10058.4,
           direction: 80,
           latitude: -6.25443,
           longitude: 113.608,
         },
         speed: {
           horizontal: 859.328,
           isGround: 0,
           vertical: 0,
         },
         status: 'en-route',
         system: {
           squawk: '0',
           updated: '1560826412',
         },
       }],
     },
    });
  });
  test('flight number that does not exist in database or incorrect', async () => {
    nock(URL)
      .get(`/v2/public/flights?key=${KEY}&flightIata=B6101`)
      .reply(200, { error: 'No Record Found or Flight not currently detected by receivers. ' });
    const response = await request(app).get('/flight/B6101/live.geojson');
    expect(JSON.parse(response.res.text)).toEqual({
      $ref: '://flight/B6101/live.geojson',
      message: 'No Record Found or Flight not currently detected by receivers. ',
    });
  });
});
