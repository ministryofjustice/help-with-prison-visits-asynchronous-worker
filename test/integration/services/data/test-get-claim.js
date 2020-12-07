const expect = require('chai').expect
const getClaim = require('../../../../app/services/data/get-claim')
const testHelper = require('../../../test-helper')

const REFERENCE = 'GETCLM1'
let claimId

describe('services/data/get-claim', function () {
  before(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', REFERENCE)
      .then(function (ids) {
        claimId = ids.claimId
      })
  })

  it('should get the claim', function () {
    return getClaim('IntSchema', claimId)
      .then(function (claim) {
        expect(claim.Reference).to.equal(REFERENCE)
      })
  })

  after(function () {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
  })
})
