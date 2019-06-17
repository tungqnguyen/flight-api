/* eslint-disable no-undef */
const flightQuery = require('@alpaca-travel/flight-query');

describe('Retrieve airport info', () => {
  test('give a valid aiport icao code', async () => {
    expect.assertions(1);
    const data = await flightQuery.findAirportInfo('00A');
    expect(data).toEqual([{
      continent: 'NA', elevation_ft: '11', gps_code: '00A', home_link: '', iata_code: '', icao_code: '00A', id: '6523', iso_country: 'US', iso_region: 'US-PA', keywords: '', latitude: 40.07080078125, local_code: '00A', longitude: -74.93360137939453, municipality: 'Bensalem', name: 'Total Rf Heliport', scheduled_service: 'no', type: 'heliport', wikipedia_link: '',
    }]);
  });
  test('give a valid aiport iata code', async () => {
    expect.assertions(1);
    const data = await flightQuery.findAirportInfo('SGN');
    expect(data).toEqual([{
      id: '26708',
      icao_code: 'VVTS',
      type: 'large_airport',
      name: 'Tan Son Nhat International Airport',
      latitude: 10.8187999725,
      longitude: 106.652000427,
      elevation_ft: '33',
      continent: 'AS',
      iso_country: 'VN',
      iso_region: 'VN-23',
      municipality: 'Ho Chi Minh City',
      scheduled_service: 'yes',
      gps_code: 'VVTS',
      iata_code: 'SGN',
      local_code: '',
      home_link: 'http://www.tsnairport.hochiminhcity.gov.vn/',
      wikipedia_link:
     'http://en.wikipedia.org/wiki/Tan_Son_Nhat_International_Airport',
      keywords: 'Tansonnhat, Sài Gòn, Saigon, Sân bay Quốc tế Tân Sơn Nhất',
    }]);
  });
  test('give an invalid aiport icao code', async () => {
    expect.assertions(1);
    const data = await flightQuery.findAirportInfo('00AAAA');
    expect(data).toEqual([]);
  });
  test('give an invalid aiport iata code', async () => {
    expect.assertions(1);
    const data = await flightQuery.findAirportInfo('SGNN');
    expect(data).toEqual([]);
  });
});

describe('Retrieve route information from today\'s flight number', () => {
  test('give a valid flight number', async () => {
    expect.assertions(1);
    const data = await flightQuery.findFlightRoute('CM276');
    expect(data).toEqual({
      flight_iata: 'CM276',
      flight_icao: 'CMP276',
      departure_iata: 'SCL',
      arrival_iata: 'PTY',
      departure_icao: 'SCEL',
      arrival_icao: 'MPTO',
      airline_iata: 'CM',
    });
  });
  test('give an invalid flight number', async () => {
    expect.assertions(1);
    const data = await flightQuery.findFlightRoute('00A');
    expect(data).toEqual({});
  });
  test('give a valid flight number and return GeoJSON format', async () => {
    expect.assertions(1);
    const data = await flightQuery.findFlightRouteGeoJson('CM276');
    expect(data).toEqual({
      type: 'LineString',
      coordinates: [[-33.393001556396484, -70.78579711914062],
        [9.0713596344, -79.3834991455]],
    });
  });
  test('give an invalid flight number and return GeoJSON format', async () => {
    expect.assertions(1);
    const data = await flightQuery.findFlightRouteGeoJson('CM27655');
    expect(data).toEqual({});
  });
});

describe('Show nearby airports on given lat/lon', () => {
  test('give a valid lat/lon pair', async () => {
    expect.assertions(1);
    const data = await flightQuery.findClosetAirport(-37.8034129, 144.9997052);
    expect(data).toEqual([{
      name: 'Royal Melbourne Hospital Helipad',
      icao_code: 'YRMH',
      iata_code: '',
      latitude: -37.799243,
      longitude: 144.95593,
      distance: 3.873922320846621,
    },
    {
      name: 'Yarra Bank Heliport',
      icao_code: 'YYBK',
      iata_code: '',
      latitude: -37.822287,
      longitude: 144.956792,
      distance: 4.314577281723933,
    },
    {
      name: 'Royal Childrens Hospital Helipad',
      icao_code: 'YRHO',
      iata_code: '',
      latitude: -37.794058,
      longitude: 144.951309,
      distance: 4.377607450520195,
    }]);
  });
  test('give an invalid lat/lon pair', async () => {
    expect.assertions(1);
    const data = await flightQuery.findClosetAirport('-37.8034129s', 'sd144.9997052');
    expect(data).toEqual('Please enter a valid lat lon');
  });
  test('give lat lon and filtered by type of small_airport', async () => {
    expect.assertions(1);
    const data = await flightQuery.findClosetAirport('-37.8034129', '144.9997052', 'small_airport');
    expect(data).toEqual([{
      name: 'RAAF Williams, Point Cook Base',
      icao_code: 'YMPC',
      iata_code: '',
      latitude: -37.932201,
      longitude: 144.753006,
      type: 'small_airport',
      distance: 25.962161953830623,
    },
    {
      name: 'Lilydale Airport',
      icao_code: 'YLIL',
      iata_code: '',
      latitude: -37.69169998168945,
      longitude: 145.36700439453125,
      type: 'small_airport',
      distance: 34.60087620462142,
    },
    {
      name: 'Coldstream Airport',
      icao_code: 'YCEM',
      iata_code: '',
      latitude: -37.72766876220703,
      longitude: 145.4083709716797,
      type: 'small_airport',
      distance: 36.89672514489765,
    }]);
  });
  test('give lat lon and filtered by iso country codes: VN', async () => {
    expect.assertions(1);
    const data = await flightQuery.findClosetAirport('-37.8034129', '144.9997052', null, 'VN');
    expect(data).toEqual([{
      name: 'Pearson Reef \'B\' Helipad',
      icao_code: 'VN-0009',
      iata_code: '',
      latitude: 8.959083,
      longitude: 113.653409,
      iso_country: 'VN',
      distance: 6134.926665709097,
    },
    {
      name: 'Truong Sa Airport',
      icao_code: 'VN-0005',
      iata_code: '',
      latitude: 8.644541,
      longitude: 111.920347,
      iso_country: 'VN',
      distance: 6202.222101508816,
    },
    {
      name: 'West London Reef Helipad',
      icao_code: 'VN-0007',
      iata_code: '',
      latitude: 8.845476,
      longitude: 112.195874,
      iso_country: 'VN',
      distance: 6205.581345286226,
    }]);
  });
});
describe('Return GeoJSON object for an array of airport codes', () => {
  test('give a series of airport codes', async () => {
    expect.assertions(1);
    const data = await flightQuery.findAirportsRoute(['SGN', 'MEL', 'SYD']);
    expect(data).toEqual({
      type: 'LineString',
      coordinates:
     [[10.8187999725, 106.652000427],
       [-37.673302, 144.843002],
       [-33.94609832763672, 151.177001953125]],
    });
  });
  test('give a series of airport codes', async () => {
    expect.assertions(1);
    const data = await flightQuery.findAirportsRoute(['SGNdf', 'MELdx', 'SYD111']);
    expect(data).toEqual({});
  });
});
