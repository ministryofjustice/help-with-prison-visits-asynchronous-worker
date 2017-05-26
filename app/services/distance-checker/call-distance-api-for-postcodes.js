const config = require('../../../config')
const log = require('../log')
const requestPromise = require('request-promise')

module.exports = function (originPostCode, destinationPostCode) {
  var distanceApiUrl = `${config.DISTANCE_CALCULATION_DIRECTIONS_API_URL}?origin=${originPostCode}&destination=${destinationPostCode}&key=${config.DISTANCE_CALCULATION_DIRECTIONS_API_KEY}`
  var options = {
    method: 'GET',
    uri: distanceApiUrl,
    json: true
  }

  return requestPromise(options)
    .then(function (result) {
      var distance = null

      if (result && result.routes && result.routes[0] &&
        result.routes[0].legs && result.routes[0].legs[0] &&
        result.routes[0].legs[0].distance && result.routes[0].legs[0].distance.value) {
        distance = (result.routes[0].legs[0].distance.value / 1000.0) * 2 // distance is in metres and add return journey
      }

      return distance
    })
    .catch(function (error) {
      // suppress errors as car expense calculation is optional
      log.error({ error: error }, 'Error calling distance calculation')
      return null
    })
}
