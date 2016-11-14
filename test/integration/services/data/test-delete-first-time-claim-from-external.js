const expect = require('chai').expect
const config = require('../../../../knexfile').asyncworker
const knex = require('knex')(config)
const testHelper = require('../../../test-helper')

const deleteFirstTimeClaimFromExternal = require('../../../../app/services/data/delete-first-time-claim-from-external')

describe('services/data/delete-first-time-claim-from-external', function () {
  var reference = 'DELETE1'
  var eligibilityId
  var claimId

  before(function () {
    return testHelper.insertClaimEligibilityData('ExtSchema', reference).then(function (ids) {
      eligibilityId = ids.eligibilityId
      claimId = ids.claimId
    })
  })

  it('should delete the first time claim from external', function () {
    return deleteFirstTimeClaimFromExternal(eligibilityId, claimId).then(function () {
      return knex('ExtSchema.Eligibility')
      .join('ExtSchema.Prisoner', 'ExtSchema.Eligibility.Reference', '=', 'ExtSchema.Prisoner.Reference')
      .join('ExtSchema.Visitor', 'ExtSchema.Eligibility.Reference', '=', 'ExtSchema.Visitor.Reference')
      .join('ExtSchema.Claim', 'ExtSchema.Eligibility.Reference', '=', 'ExtSchema.Claim.Reference')
      .where('ExtSchema.Eligibility.Reference', reference)
      .count('ExtSchema.Eligibility.Reference as count')
      .then(function (countResult) {
        expect(countResult[0].count).to.be.equal(0)

        return knex('ExtSchema.ClaimBankDetail')
          .join('ExtSchema.ClaimExpense', 'ExtSchema.ClaimBankDetail.ClaimId', '=', 'ExtSchema.ClaimExpense.ClaimId')
          .where('ExtSchema.ClaimBankDetail.ClaimId', claimId)
          .count('ExtSchema.ClaimBankDetail.ClaimId as count')
          .then(function (countResult) {
            expect(countResult[0].count).to.be.equal(0)
          })
      })
    })
  })

  after(function () {
    return testHelper.deleteAll(reference, 'IntSchema')
  })
})
