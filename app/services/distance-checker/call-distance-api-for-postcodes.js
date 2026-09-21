const config = require('../../../config')
const log = require('../log')

module.exports = (originPostCode, destinationPostCode) => {
  const distanceApiUrl = `${config.DISTANCE_CALCULATION_DIRECTIONS_API_URL}?origin=${originPostCode}&destination=${destinationPostCode}&key=${config.DISTANCE_CALCULATION_DIRECTIONS_API_KEY}`

  return fetch(distanceApiUrl)
    .then(result => result.json())
    .then(result => {
      let distance = null
      const apiStatus = result && result.data ? result.data.status : null

      if (apiStatus !== 'OK') {
        log.error(
          {
            originPostCode,
            destinationPostCode,
            apiStatus,
            apiErrorMessage: result && result.data ? result.data.error_message : null,
          },
          'Distance calculation API returned an unsuccessful response',
        )
      }

      if (
        result &&
        result.data &&
        result.data.routes &&
        result.data.routes[0] &&
        result.data.routes[0].legs &&
        result.data.routes[0].legs[0] &&
        result.data.routes[0].legs[0].distance &&
        result.data.routes[0].legs[0].distance.value
      ) {
        distance = (result.data.routes[0].legs[0].distance.value / 1000.0) * 2 // distance is in metres and add return journey
      }

      return distance
    })
    .catch(error => {
      // suppress errors as car expense calculation is optional
      log.error(
        {
          originPostCode,
          destinationPostCode,
          errorMessage: error.message,
          errorCode: error.code,
          httpStatus: error.response ? error.response.status : null,
          apiStatus: error.response && error.response.data ? error.response.data.status : null,
          apiErrorMessage: error.response && error.response.data ? error.response.data.error_message : null,
        },
        'Error calling distance calculation',
      )
      return null
    })
}
