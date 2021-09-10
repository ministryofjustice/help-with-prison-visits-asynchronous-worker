const config = require('../../../config')
const log = require('../log')
const axios = require('axios')

module.exports = function (originPostCode, destinationPostCode) {
  const distanceApiUrl = `${config.DISTANCE_CALCULATION_DIRECTIONS_API_URL}?origin=${originPostCode}&destination=${destinationPostCode}&key=${config.DISTANCE_CALCULATION_DIRECTIONS_API_KEY}`

  return axios
    .get(distanceApiUrl)
    .then(function (result) {
      let distance = null

      if (result && result.data && result.data.routes && result.data.routes[0] &&
        result.data.routes[0].legs && result.data.routes[0].legs[0] &&
        result.data.routes[0].legs[0].distance && result.data.routes[0].legs[0].distance.value) {
        distance = (result.data.routes[0].legs[0].distance.value / 1000.0) * 2 // distance is in metres and add return journey
      }

      return distance
    })
    .catch(function (error) {
      // suppress errors as car expense calculation is optional
      log.error({ error: error }, 'Error calling distance calculation')
      return null
    })
}
