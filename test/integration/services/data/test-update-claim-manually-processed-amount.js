const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const expect = require('chai').expect
const testHelper = require('../../../test-helper')
const updateClaimManuallyProcessedAmount = require('../../../../app/services/data/update-claim-manually-processed-amount')
describe('services/data/update-claim-manually-processed-amount', function () {
  const REFERENCE = 'UPDATE13'
  let claimId
  before(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', REFERENCE)
      .then(function (ids) {
        claimId = ids.claimId
      })
  })

  it('should update the manually processed column for a particular claim', function () {
    return updateClaimManuallyProcessedAmount(claimId, '12')
      .then(function () {
        const db = getDatabaseConnector()

        return db('IntSchema.Claim')
          .select('ManuallyProcessedAmount')
          .where('ClaimId', claimId)
          .then(function (result) {
            expect(result[0].ManuallyProcessedAmount, 'manually processed amount should equal 12').to.equal(12)
          })
      })
  })

  it('should update the manually processed column for a particular claim given a decimal number', function () {
    return updateClaimManuallyProcessedAmount(claimId, '12.10')
      .then(function () {
        const db = getDatabaseConnector()

        return db('IntSchema.Claim')
          .select('ManuallyProcessedAmount')
          .where('ClaimId', claimId)
          .then(function (result) {
            expect(result[0].ManuallyProcessedAmount, 'manually processed amount should equal 12.10').to.equal(12.10)
          })
      })
  })

  after(function () {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
  })
})
