const flightQuery = require('@alpaca-travel/flight-query');

const filter = {
  filterByCountries(flightObj, airportsByCountry) {
    for (let i = 0; i < airportsByCountry.length; i += 1) {
      if (
        flightObj.arrival.iataCode != undefined
        && flightObj.arrival.iataCode == airportsByCountry[i].iata_code
      ) {
        return true;
      }
      if (
        flightObj.arrival.icaoCode != undefined
        && flightObj.arrival.icaoCode == airportsByCountry[i].icao_code
      ) {
        return true;
      }
    }
    return false;
  },
  filterByAirline(flightObj, airline) {
    if (flightObj.airline.iataCode == airline || flightObj.airline.icaoCode == airline) {
      return true;
    }
    return false;
  },
  filterByParams(flightList, paramsObject) {
    let destCountry = null;
    let airline = null;
    let airportsByCountry = [];
    Object.keys(paramsObject).map(async (key) => {
      switch (key) {
        case 'airline':
          airline = paramsObject[key];
          break;
        case 'destCountry':
          destCountry = paramsObject[key];
          airportsByCountry = await flightQuery.findAirportsByCountry(destCountry);
          break;
        default:
      }
    });
    const filteredData = flightList.filter((element, i) => {
      let countryFilter = null;
      let airlineFilter = null;
      if (destCountry != null) countryFilter = filter.filterByCountries(element, airportsByCountry);
      if (airline != null) airlineFilter = filter.filterByAirline(element, airline);
      if (countryFilter == null && airlineFilter == null) return true;
      if (countryFilter == true && airlineFilter == null) return true;
      if (countryFilter == null && airlineFilter == true) return true;
      if (countryFilter && airlineFilter) return true;
    });
    console.log('filtered', filteredData);
    return filteredData;
  },
};

module.exports = filter;
