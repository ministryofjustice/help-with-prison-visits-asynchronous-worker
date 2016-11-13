const expect = require('chai').expect
const testHelper = require('../../../test-helper')

const getAllFirstTimeClaimData = require('../../../../app/services/data/get-all-first-time-claim-data')

describe('services/data/get-all-first-time-claim-data', function () {
  var reference = 'FIRST12'
  var eligibilityId
  var claimId

  before(function () {
    return testHelper.insertClaimEligibilityData('ExtSchema', reference)
      .then(function (ids) {
        eligibilityId = ids.eligibilityId
        claimId = ids.claimId
      })
  })

  it('should return all First time claim data', function () {
    return getAllFirstTimeClaimData(reference, eligibilityId, claimId, 'SUBMITTED')
      .then(function (data) {
        expect(data.Eligibility.Reference).to.be.equal(reference)
        expect(data.Claim.Reference).to.be.equal(reference)
        expect(data.Prisoner.Reference).to.be.equal(reference)
        expect(data.Visitor.Reference).to.be.equal(reference)
        expect(data.ClaimExpenses[0].ClaimId).to.be.equal(claimId)
        expect(data.ClaimBankDetail.ClaimId).to.be.equal(claimId)
        expect(data.ClaimChildren[0].ClaimId).to.be.equal(claimId)
        expect(data.ClaimDocument[0].ClaimId).to.be.equal(claimId)
      })
  })

  after(function () {
    return testHelper.deleteAll(reference, 'IntSchema')
  })
})
