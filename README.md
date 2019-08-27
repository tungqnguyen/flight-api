# README #

This is a flight API to query any flight or find out information about an aiport. There are many API endpoints that you can used to retreive aviation-related data.
##Framework
Node.js, Redis, SQLite database.
## Available Endpoints
> http://localhost:3000/airport/{airportCode}/
- Return information about an aiport, accept icao and iata code.
> http://localhost:3000/airport/{airportCode}/flights/{type}
- Return all flights of an airport, where {type} can be "departure" or "arrival". If {type} is "arrival" then a param "destCountry" is required.
