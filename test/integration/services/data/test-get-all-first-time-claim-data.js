const expect = require('chai').expect
const testHelper = require('../../../test-helper')

const getAllFirstTimeClaimData = require('../../../../app/services/data/get-all-first-time-claim-data')

describe('services/data/get-all-first-time-claim-data', function () {
  var reference = 'FIRST12'
  var claimId

  before(function (done) {
    testHelper.insertClaimEligibilityData('ExtSchema', reference).then(function (newClaimId) {
      claimId = newClaimId
      done()
    })
  })

  it('should return all First time claim data', function (done) {
    getAllFirstTimeClaimData(reference, claimId, 'SUBMITTED').then(function (data) {
      expect(data.Eligibility.Reference).to.be.equal(reference)
      expect(data.Claim.Reference).to.be.equal(reference)
      expect(data.Prisoner.Reference).to.be.equal(reference)
      expect(data.Visitor.Reference).to.be.equal(reference)
      expect(data.ClaimExpenses[0].ClaimId).to.be.equal(claimId)
      expect(data.ClaimBankDetail.ClaimId).to.be.equal(claimId)
      done()
    })
  })

  after(function (done) {
    testHelper.deleteAllExternalClaimEligibilityData(reference, claimId).then(function () {
      done()
    })
  })
})
