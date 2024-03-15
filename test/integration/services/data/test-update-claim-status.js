const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const testHelper = require('../../../test-helper')

const updateClaimStatus = require('../../../../app/services/data/update-claim-status')

const STATUS = 'TEST'
const REFERENCE = 'UPCLMSD'
let claimId

describe('services/data/update-claim-status', function () {
  beforeEach(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', REFERENCE)
      .then(function (ids) {
        claimId = ids.claimId
      })
  })

  it('should update Claim Status to NEW', function () {
    return updateClaimStatus(claimId, STATUS)
      .then(function () {
        const db = getDatabaseConnector()

        return db('IntSchema.Claim').where('ClaimId', claimId).first()
          .then(function (claim) {
            expect(claim.Status).toBe(STATUS)
          });
      });
  })

  afterEach(function () {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
  })
})
