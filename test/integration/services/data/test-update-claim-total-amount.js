const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const testHelper = require('../../../test-helper')
const updateClaimTotalAmount = require('../../../../app/services/data/update-claim-total-amount')
describe('services/data/update-claim-total-amount', function () {
  const REFERENCE = 'UPDATE12'
  let claimId
  beforeAll(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', REFERENCE)
      .then(function (ids) {
        claimId = ids.claimId
      })
  })

  it('should update the manually processed column for a particular claim', function () {
    return updateClaimTotalAmount(claimId, '12')
      .then(function () {
        const db = getDatabaseConnector()

        return db('IntSchema.Claim')
          .select('TotalAmount')
          .where('ClaimId', claimId)
          .then(function (result) {
            // total amount should equal 12
            expect(result[0].TotalAmount).toBe(12)
          })
      })
  })

  it('should update the manually processed column for a particular claim given a decimal value', function () {
    return updateClaimTotalAmount(claimId, '12.10')
      .then(function () {
        const db = getDatabaseConnector()

        return db('IntSchema.Claim')
          .select('TotalAmount')
          .where('ClaimId', claimId)
          .then(function (result) {
            // total amount should equal 12.12
            expect(result[0].TotalAmount).toBe(12.10)
          })
      })
  })

  afterAll(function () {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
  })
})
