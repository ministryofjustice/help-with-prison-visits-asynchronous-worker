const getClaim = require('../../../../app/services/data/get-claim')
const testHelper = require('../../../test-helper')

const REFERENCE = 'GETCLM1'
let claimId

describe('services/data/get-claim', function () {
  beforeAll(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', REFERENCE)
      .then(function (ids) {
        claimId = ids.claimId
      })
  })

  it('should get the claim', function () {
    return getClaim('IntSchema', claimId)
      .then(function (claim) {
        expect(claim.Reference).toBe(REFERENCE)
      });
  })

  afterAll(function () {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
  })
})
