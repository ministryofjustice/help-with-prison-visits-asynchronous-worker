const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const testHelper = require('../../../test-helper')
const updateClaimManuallyProcessedAmount = require('../../../../app/services/data/update-claim-manually-processed-amount')

describe('services/data/update-claim-manually-processed-amount', () => {
  const REFERENCE = 'UPDATE13'
  let claimId
  beforeAll(() => {
    return testHelper.insertClaimEligibilityData('IntSchema', REFERENCE).then(ids => {
      claimId = ids.claimId
    })
  })

  it('should update the manually processed column for a particular claim', () => {
    return updateClaimManuallyProcessedAmount(claimId, '12').then(() => {
      const db = getDatabaseConnector()

      return db('IntSchema.Claim')
        .select('ManuallyProcessedAmount')
        .where('ClaimId', claimId)
        .then(result => {
          // manually processed amount should equal 12
          expect(result[0].ManuallyProcessedAmount).toBe(12)
        })
    })
  })

  it('should update the manually processed column for a particular claim given a decimal number', () => {
    return updateClaimManuallyProcessedAmount(claimId, '12.10').then(() => {
      const db = getDatabaseConnector()

      return db('IntSchema.Claim')
        .select('ManuallyProcessedAmount')
        .where('ClaimId', claimId)
        .then(result => {
          // manually processed amount should equal 12.10
          expect(result[0].ManuallyProcessedAmount).toBe(12.1)
        })
    })
  })

  afterAll(() => {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
  })
})
