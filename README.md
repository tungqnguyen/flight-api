# README #

This is a flight API to query any flight or find out information about an aiport. There are many API endpoints that you can used to retreive aviation-related data.
##Framework
Node.js, Redis, SQLite database.
## Available Endpoints
> http://localhost:3000/airport/{airportCode}/
- Example `http://localhost:3000/airport/JFK`
- Return information about an aiport, accept icao and iata code.
> http://localhost:3000/airport/{airportCode}/flights/{type}
- Example `http://localhost:3000/airport/JFK/flights/departure/?page=10&limit=30`
- query available: limit, page, destCountry, airline
- Return all flights of an airport, where {type} can be "departure" or "arrival". If {type} is "arrival" then a param "destCountry" is required.
> http://localhost:3000/search/airport/?lat={latitude}&lon={longitude}
- Example `http://localhost:3000/search/airport/?lat=-37.8034129&lon=144.9997052`
- Return the closet aiport based on lat,lon
> http://localhost:3000/flight/{airportCode}
- Example `http://localhost:3000/flight/LAN530`
- For a flight number, supply information about the route
> http://localhost:3000/flight/{airportCode}/route.geojson
- Example `http://localhost:3000/flight/LAN530/route.geojson`
- For a flight number, supply information about the route but as geoJson format
> http://localhost:3000/flight/{airportCode}/live.geojson
- Example `http://localhost:3000/flight/AC1/live.geojson`
- For a flight number, provide the location of the plane on the route as GeoJSON Point
> http://localhost:3000/search/flight/route/
- Example `http://localhost:3000/search/flight/route?airports=MEL,SYD,PEK`
- For a series of supplied airport codes, return a route between these points
