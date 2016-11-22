const expect = require('chai').expect
const config = require('../../../../knexfile').asyncworker
const knex = require('knex')(config)
const statusEnum = require('../../../../app/constants/status-enum')
const testHelper = require('../../../test-helper')

const copyClaimDataToInternal = require('../../../../app/services/data/copy-claim-data-to-internal')
const reference = 'COPY123'
const claimId = 123
describe('services/data/copy-first-time-claim-data-to-internal', function () {
  describe('first time claim', function () {
    var firstTimeClaimData = testHelper.getFirstTimeClaimData(reference, claimId)

    it('should copy the first time claim data to internal and set status to new', function () {
      return copyClaimDataToInternal(firstTimeClaimData).then(function () {
        return knex('IntSchema.Eligibility').where('IntSchema.Eligibility.Reference', reference)
          .join('IntSchema.Prisoner', 'IntSchema.Eligibility.EligibilityId', '=', 'IntSchema.Prisoner.EligibilityId')
          .join('IntSchema.Visitor', 'IntSchema.Eligibility.EligibilityId', '=', 'IntSchema.Visitor.EligibilityId')
          .join('IntSchema.Claim', 'IntSchema.Eligibility.EligibilityId', '=', 'IntSchema.Claim.EligibilityId')
          .join('IntSchema.ClaimChild', 'IntSchema.Claim.ClaimId', '=', 'IntSchema.ClaimChild.ClaimId')
          .join('IntSchema.ClaimBankDetail', 'IntSchema.Claim.ClaimId', '=', 'IntSchema.ClaimBankDetail.ClaimId')
          .join('IntSchema.ClaimExpense', 'IntSchema.Claim.ClaimId', '=', 'IntSchema.ClaimExpense.ClaimId')
          .select()
          .then(function (results) {
            expect(results[0].Status[0], 'Eligibility.Status should be NEW').to.be.equal(statusEnum.NEW)
            expect(results[0].Status[1], 'Claim.Status should be NEW').to.be.equal(statusEnum.NEW)
            expect(results[0].AccountNumber).to.be.equal(firstTimeClaimData.ClaimBankDetail.AccountNumber)
            expect(results.length, 'Should have four rows, two child and two expense').to.be.equal(4)
            expect(results[0].ExpenseType).to.be.equal('car')
            expect(results[2].Cost).to.be.equal(20.95)
            expect(results[0].NationalInsuranceNumber).to.be.equal(firstTimeClaimData.Visitor.NationalInsuranceNumber)
            expect(results[0].PrisonNumber).to.be.equal(firstTimeClaimData.Prisoner.PrisonNumber)
          })
      })
    })

    it('should change claim status to PENDING if documents not uploaded', function () {
      firstTimeClaimData.ClaimDocument[0].DocumentStatus = 'post-later'
      firstTimeClaimData.ClaimDocument[1].DocumentStatus = 'upload-later'

      return copyClaimDataToInternal(firstTimeClaimData).then(function () {
        return knex('IntSchema.Claim').where('IntSchema.Claim.Reference', reference)
          .select('Claim.Status')
          .then(function (results) {
            expect(results[0].Status, 'Claim.Status should be PENDING').to.be.equal(statusEnum.PENDING)
          })
      })
    })
  })

  describe('repeat claim', function () {
    const repeatClaimData = testHelper.getFirstTimeClaimData(reference, claimId)
    repeatClaimData.Eligibility = undefined
    repeatClaimData.Visitor = undefined
    repeatClaimData.Prisoner = undefined

    it('should change claim status to PENDING if documents not uploaded', function () {
      return copyClaimDataToInternal(repeatClaimData).then(function () {
        return knex('IntSchema.Claim').where('IntSchema.Claim.Reference', reference)
          .join('IntSchema.ClaimChild', 'IntSchema.Claim.ClaimId', '=', 'IntSchema.ClaimChild.ClaimId')
          .join('IntSchema.ClaimBankDetail', 'IntSchema.Claim.ClaimId', '=', 'IntSchema.ClaimBankDetail.ClaimId')
          .join('IntSchema.ClaimExpense', 'IntSchema.Claim.ClaimId', '=', 'IntSchema.ClaimExpense.ClaimId')
          .select()
          .then(function (results) {
            expect(results.length, 'Should have four rows, two child and two expense').to.be.equal(4)
            expect(results[0].Status[0], 'Claim.Status should be NEW').to.be.equal(statusEnum.NEW)
            expect(results[0].Reference[0]).to.be.equal(reference)
          })
      })
    })
  })

  afterEach(function () {
    return testHelper.deleteAll(reference, 'IntSchema')
  })
})
