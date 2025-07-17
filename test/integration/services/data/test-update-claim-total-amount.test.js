const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const testHelper = require('../../../test-helper')
const updateClaimTotalAmount = require('../../../../app/services/data/update-claim-total-amount')

describe('services/data/update-claim-total-amount', () => {
  const REFERENCE = 'UPDATE12'
  let claimId
  beforeAll(() => {
    return testHelper.insertClaimEligibilityData('IntSchema', REFERENCE).then(ids => {
      claimId = ids.claimId
    })
  })

  it('should update the manually processed column for a particular claim', () => {
    return updateClaimTotalAmount(claimId, '12').then(() => {
      const db = getDatabaseConnector()

      return db('IntSchema.Claim')
        .select('TotalAmount')
        .where('ClaimId', claimId)
        .then(result => {
          // total amount should equal 12
          expect(result[0].TotalAmount).toBe(12)
        })
    })
  })

  it('should update the manually processed column for a particular claim given a decimal value', () => {
    return updateClaimTotalAmount(claimId, '12.10').then(() => {
      const db = getDatabaseConnector()

      return db('IntSchema.Claim')
        .select('TotalAmount')
        .where('ClaimId', claimId)
        .then(result => {
          // total amount should equal 12.12
          expect(result[0].TotalAmount).toBe(12.1)
        })
    })
  })

  afterAll(() => {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
  })
})
