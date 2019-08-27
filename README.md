# README #

This is a flight API to query any flight or find out information about an aiport. There are many API endpoints that you can used to retreive aviation-related data.
##Framework
Node.js, Redis, SQLite database.
## Available Endpoints
> http://localhost:3000/airport/{airportCode}/
- Return information about an aiport, accept icao and iata code.
> http://localhost:3000/airport/{airportCode}/flights/{type}
-query available: limit, page, destCountry, airline
- Return all flights of an airport, where {type} can be "departure" or "arrival". If {type} is "arrival" then a param "destCountry" is required.
> http://localhost:3000/search/airport/?lat={latitude}&lon={longitude}
- Return the closet aiport based on lat,lon
> http://localhost:3000/flight/{airportCode}
- For a flight number, supply information about the route
> http://localhost:3000/flight/{airportCode}/route.geojson
- For a flight number, supply information about the route but as geoJson format
> http://localhost:3000/flight/{airportCode}/live.geojson
- For a flight number, provide the location of the plane on the route as GeoJSON Point
> http://localhost:3000/search/flight/route/
- For a series of supplied airport codes, return a route between these points
