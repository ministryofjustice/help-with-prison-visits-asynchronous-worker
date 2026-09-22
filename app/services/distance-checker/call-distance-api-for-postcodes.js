const config = require('../../../config')
const log = require('../log')

module.exports = (originPostCode, destinationPostCode) => {
  const distanceApiUrl = `${config.DISTANCE_CALCULATION_DIRECTIONS_API_URL}?origin=${originPostCode}&destination=${destinationPostCode}&key=${config.DISTANCE_CALCULATION_DIRECTIONS_API_KEY}`

  return fetch(distanceApiUrl)
    .then(response => {
      return response
        .json()
        .then(result => ({ response, result }))
        .catch(error => {
          log.error(
            {
              originPostCode,
              destinationPostCode,
              httpStatus: response.status,
              httpStatusText: response.statusText,
              errorName: error.name,
              errorMessage: error.message,
            },
            'Error parsing distance calculation API response',
          )
          return null
        })
    })
    .then(apiResponse => {
      if (!apiResponse) {
        return null
      }

      const { response, result } = apiResponse
      let distance = null
      const apiStatus = result ? result.status : null

      if (!response.ok || apiStatus !== 'OK') {
        log.error(
          {
            originPostCode,
            destinationPostCode,
            httpStatus: response.status,
            httpStatusText: response.statusText,
            apiStatus,
            apiErrorMessage: result ? result.error_message : null,
          },
          'Distance calculation API returned an unsuccessful response',
        )
        return null
      }

      if (
        result &&
        result.routes &&
        result.routes[0] &&
        result.routes[0].legs &&
        result.routes[0].legs[0] &&
        result.routes[0].legs[0].distance &&
        result.routes[0].legs[0].distance.value
      ) {
        distance = (result.routes[0].legs[0].distance.value / 1000.0) * 2 // distance is in metres and add return journey
      }

      return distance
    })
    .catch(error => {
      // suppress errors as car expense calculation is optional
      log.error(
        {
          originPostCode,
          destinationPostCode,
          errorName: error.name,
          errorMessage: error.message,
          errorCode: error.cause && error.cause.code ? error.cause.code : error.code,
        },
        'Error calling distance calculation',
      )
      return null
    })
}
