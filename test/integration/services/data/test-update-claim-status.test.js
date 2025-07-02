const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const testHelper = require('../../../test-helper')

const updateClaimStatus = require('../../../../app/services/data/update-claim-status')

const STATUS = 'TEST'
const REFERENCE = 'UPCLMSD'
let claimId

describe('services/data/update-claim-status', () => {
  beforeEach(() => {
    return testHelper.insertClaimEligibilityData('IntSchema', REFERENCE).then(ids => {
      claimId = ids.claimId
    })
  })

  it('should update Claim Status to NEW', () => {
    return updateClaimStatus(claimId, STATUS).then(() => {
      const db = getDatabaseConnector()

      return db('IntSchema.Claim')
        .where('ClaimId', claimId)
        .first()
        .then(claim => {
          expect(claim.Status).toBe(STATUS)
        })
    })
  })

  afterEach(() => {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
  })
})
