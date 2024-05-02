const callDistanceApiForPostcodes = require('../../../../app/services/distance-checker/call-distance-api-for-postcodes')

const FROM_POSTCODE = 'BT7 1NT' // Upper Crescent, Belfast
const TO_POSTCODE = 'BT48 7NR' // Strand Road, Londonderry
const APPROXIMATE_EXPECTED_DISTANCE = 230 // Return journey cost

describe('services/distance-checker/call-distance-api-for-postcodes', function () {
  it('should call the distance API and return a distance in kilometers', function () {
    return callDistanceApiForPostcodes(FROM_POSTCODE, TO_POSTCODE).then(function (distanceInKm) {
      // check that the distance returned is between 230 and 240 as this changes frequently
      expect(distanceInKm >= APPROXIMATE_EXPECTED_DISTANCE && distanceInKm <= APPROXIMATE_EXPECTED_DISTANCE + 10).toBe(
        true,
      )
    })
  })
})
