const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const testHelper = require('../../../test-helper')

const deleteClaimFromExternal = require('../../../../app/services/data/delete-claim-from-external')

describe('services/data/delete-claim-from-external', () => {
  const reference = 'DELETE1'
  let eligibilityId
  let claimId

  beforeEach(() => {
    return testHelper.insertClaimEligibilityData('ExtSchema', reference).then(ids => {
      eligibilityId = ids.eligibilityId
      claimId = ids.claimId
    })
  })

  it('should delete the first time claim from external', () => {
    const db = getDatabaseConnector()

    return db
      .transaction(trx => {
        return deleteClaimFromExternal(eligibilityId, claimId, trx)
      })
      .then(() => {
        return db('ExtSchema.Eligibility')
          .join('ExtSchema.Prisoner', 'ExtSchema.Eligibility.Reference', '=', 'ExtSchema.Prisoner.Reference')
          .join('ExtSchema.Visitor', 'ExtSchema.Eligibility.Reference', '=', 'ExtSchema.Visitor.Reference')
          .join('ExtSchema.Claim', 'ExtSchema.Eligibility.Reference', '=', 'ExtSchema.Claim.Reference')
          .where('ExtSchema.Eligibility.Reference', reference)
          .count('ExtSchema.Eligibility.Reference as count')
          .then(countResult => {
            expect(countResult[0].count).toBe(0)

            return db('ExtSchema.ClaimBankDetail')
              .join(
                'ExtSchema.ClaimExpense',
                'ExtSchema.ClaimBankDetail.ClaimId',
                '=',
                'ExtSchema.ClaimExpense.ClaimId',
              )
              .where('ExtSchema.ClaimBankDetail.ClaimId', claimId)
              .count('ExtSchema.ClaimBankDetail.ClaimId as count')
              .then(claimBankDetailCountResult => {
                expect(claimBankDetailCountResult[0].count).toBe(0)
              })
          })
      })
  })

  it('should not throw an error when only eligibility id is supplied', () => {
    const db = getDatabaseConnector()

    return db
      .transaction(trx => {
        return deleteClaimFromExternal(eligibilityId, null, trx)
      })
      .catch(error => {
        expect.fail(error)
      })
  })

  afterEach(() => {
    return Promise.all([testHelper.deleteAll(reference, 'IntSchema'), testHelper.deleteAll(reference, 'ExtSchema')])
  })
})
