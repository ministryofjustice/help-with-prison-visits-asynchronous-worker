const expect = require('chai').expect
const testHelper = require('../../../test-helper')

const getAllClaimData = require('../../../../app/services/data/get-all-claim-data')

describe('services/data/get-all-claim-data', function () {
  describe('get first time claim data', function () {
    const REFERENCE = 'FIRST12'
    var eligibilityId
    var claimId

    before(function () {
      return testHelper.insertClaimEligibilityData('ExtSchema', REFERENCE)
        .then(function (ids) {
          eligibilityId = ids.eligibilityId
          claimId = ids.claimId
        })
    })

    it('should return all first time claim data', function () {
      return getAllClaimData(REFERENCE, eligibilityId, claimId, 'SUBMITTED')
        .then(function (data) {
          expect(data.Eligibility.Reference).to.be.equal(REFERENCE)
          expect(data.Claim.Reference).to.be.equal(REFERENCE)
          expect(data.Prisoner.Reference).to.be.equal(REFERENCE)
          expect(data.Visitor.Reference).to.be.equal(REFERENCE)
          expect(data.ClaimExpenses[0].ClaimId).to.be.equal(claimId)
          expect(data.ClaimBankDetail.ClaimId).to.be.equal(claimId)
          expect(data.ClaimChildren[0].ClaimId).to.be.equal(claimId)
          expect(data.ClaimDocument[0].ClaimId).to.be.equal(claimId)
        })
    })

    after(function () {
      return testHelper.deleteAll(REFERENCE, 'ExtSchema')
    })
  })

  describe('get repeat claim data', function () {
    const REFERENCE = 'REPEAT5'
    const ELIGIBILITYID = 4321
    var claimId

    before(function () {
      return testHelper.insertClaimData('ExtSchema', REFERENCE, ELIGIBILITYID, testHelper.getClaimData(REFERENCE))
        .then(function (newClaimId) {
          claimId = newClaimId
        })
    })

    it('should return all repeat claim data', function () {
      return getAllClaimData(REFERENCE, ELIGIBILITYID, claimId, 'SUBMITTED')
        .then(function (data) {
          expect(data.Eligibility).to.be.undefined
          expect(data.Prisoner).to.be.undefined
          expect(data.Visitor).to.be.undefined
          expect(data.Claim.Reference).to.be.equal(REFERENCE)
          expect(data.Claim.EligibilityId).to.be.equal(ELIGIBILITYID)
          expect(data.ClaimExpenses[0].ClaimId).to.be.equal(claimId)
          expect(data.ClaimBankDetail.ClaimId).to.be.equal(claimId)
          expect(data.ClaimChildren[0].ClaimId).to.be.equal(claimId)
          expect(data.ClaimDocument[0].ClaimId).to.be.equal(claimId)
          expect(data.EligibilityVisitorUpdateContactDetail.EligibilityId).to.be.equal(ELIGIBILITYID)
        })
    })

    after(function () {
      return testHelper.deleteAll(REFERENCE, 'ExtSchema')
    })
  })
})
