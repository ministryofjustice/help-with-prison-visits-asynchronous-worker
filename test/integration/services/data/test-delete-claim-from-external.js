const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const testHelper = require('../../../test-helper')

const deleteClaimFromExternal = require('../../../../app/services/data/delete-claim-from-external')

describe('services/data/delete-claim-from-external', function () {
  const reference = 'DELETE1'
  let eligibilityId
  let claimId

  beforeEach(function () {
    return testHelper.insertClaimEligibilityData('ExtSchema', reference)
      .then(function (ids) {
        eligibilityId = ids.eligibilityId
        claimId = ids.claimId
      })
  })

  it('should delete the first time claim from external', function () {
    const db = getDatabaseConnector()

    return db.transaction(function (trx) {
      return deleteClaimFromExternal(eligibilityId, claimId, trx)
    })
      .then(function () {
        return db('ExtSchema.Eligibility')
          .join('ExtSchema.Prisoner', 'ExtSchema.Eligibility.Reference', '=', 'ExtSchema.Prisoner.Reference')
          .join('ExtSchema.Visitor', 'ExtSchema.Eligibility.Reference', '=', 'ExtSchema.Visitor.Reference')
          .join('ExtSchema.Claim', 'ExtSchema.Eligibility.Reference', '=', 'ExtSchema.Claim.Reference')
          .where('ExtSchema.Eligibility.Reference', reference)
          .count('ExtSchema.Eligibility.Reference as count')
          .then(function (countResult) {
            expect(countResult[0].count).toBe(0)

            return db('ExtSchema.ClaimBankDetail')
              .join('ExtSchema.ClaimExpense', 'ExtSchema.ClaimBankDetail.ClaimId', '=', 'ExtSchema.ClaimExpense.ClaimId')
              .where('ExtSchema.ClaimBankDetail.ClaimId', claimId)
              .count('ExtSchema.ClaimBankDetail.ClaimId as count')
              .then(function (countResult) {
                expect(countResult[0].count).toBe(0)
              });
          });
      });
  })

  it('should not throw an error when only eligibility id is supplied', function () {
    const db = getDatabaseConnector()

    return db.transaction(function (trx) {
      return deleteClaimFromExternal(eligibilityId, null, trx)
    })
      .then(function () {
      }).catch(function (err) {
        expect.fail(err)
      })
  })

  afterEach(function () {
    return Promise.all([
      testHelper.deleteAll(reference, 'IntSchema'),
      testHelper.deleteAll(reference, 'ExtSchema')
    ])
  })
})
