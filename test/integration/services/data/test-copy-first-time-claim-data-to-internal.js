const expect = require('chai').expect
const config = require('../../../../knexfile').asyncworker
const knex = require('knex')(config)
const statusEnum = require('../../../../app/constants/status-enum')
const testHelper = require('../../../test-helper')

const copyFirstTimeClaimDataToInternal = require('../../../../app/services/data/copy-first-time-claim-data-to-internal')

describe('services/data/copy-first-time-claim-data-to-internal', function () {
  var reference = 'COPY123'
  var claimId = 123
  var firstTimeClaimData = testHelper.getFirstTimeClaimData(reference, claimId)

  it('should copy the first time claim data to internal', function () {
    return copyFirstTimeClaimDataToInternal(firstTimeClaimData).then(function () {
      return knex('IntSchema.Eligibility').where('Reference', reference)
        .join('IntSchema.Prisoner', 'IntSchema.Eligibility.EligibilityId', '=', 'IntSchema.Prisoner.EligibilityId')
        .join('IntSchema.Visitor', 'IntSchema.Eligibility.EligibilityId', '=', 'IntSchema.Visitor.EligibilityId')
        .join('IntSchema.Claim', 'IntSchema.Eligibility.EligibilityId', '=', 'IntSchema.Claim.EligibilityId')
        .join('IntSchema.ClaimBankDetail', 'IntSchema.Claim.ClaimId', '=', 'IntSchema.ClaimBankDetail.ClaimId')
        .join('IntSchema.ClaimExpense', 'IntSchema.Claim.ClaimId', '=', 'IntSchema.ClaimExpense.ClaimId')
        .select()
        .then(function (results) {
          expect(results[0].Status[0], 'Eligibility.Status should be NEW').to.be.equal(statusEnum.NEW)
          expect(results[0].Status[1], 'Claim.Status should be NEW').to.be.equal(statusEnum.NEW)
          expect(results[0].AccountNumber).to.be.equal(firstTimeClaimData.ClaimBankDetail.AccountNumber)
          expect(results.length, 'Should have two ClaimExpense').to.be.equal(2)
          expect(results[0].ExpenseType).to.be.equal('car')
          expect(results[1].Cost).to.be.equal(20.95)
          expect(results[0].NationalInsuranceNumber).to.be.equal(firstTimeClaimData.Visitor.NationalInsuranceNumber)
          expect(results[0].PrisonNumber).to.be.equal(firstTimeClaimData.Prisoner.PrisonNumber)
        })
    })
  })

  after(function () {
    return testHelper.deleteAllInternalClaimEligibilityData(reference)
  })
})
