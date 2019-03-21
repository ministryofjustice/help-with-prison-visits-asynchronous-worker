const expect = require('chai').expect

const callDistanceApiForPostcodes = require('../../../../app/services/distance-checker/call-distance-api-for-postcodes')

const FROM_POSTCODE = 'BT7 1NT' // Upper Crescent, Belfast
const TO_POSTCODE = 'BT48 7NR' // Strand Road, Londonderry
const EXPECTED_DISTANCE = 233.62 // Return journey cost

describe('services/distance-checker/call-distance-api-for-postcodes', function () {
  it('should call the distance API and return a distance in kilometers', function () {
    return callDistanceApiForPostcodes(FROM_POSTCODE, TO_POSTCODE)
      .then(function (distanceInKm) {
        expect(distanceInKm).to.equal(EXPECTED_DISTANCE)
      })
  })
})
