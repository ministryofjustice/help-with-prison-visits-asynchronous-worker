const config = require('../../../../knexfile').asyncworker
const knex = require('knex')(config)
const expect = require('chai').expect
const testHelper = require('../../../test-helper')
const updateClaimManuallyProcessedAmount = require('../../../../app/services/data/update-claim-manually-processed-amount')
describe('services/data/update-claim-manually-processed-amount', function () {
  const REFERENCE = 'UPDATE13'
  var claimId
  before(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', REFERENCE)
      .then(function (ids) {
        claimId = ids.claimId
      })
  })

  it('should update the manually processed column for a particular claim', function () {
    return updateClaimManuallyProcessedAmount(claimId, '12')
      .then(function () {
        knex('IntSchema.Claim')
          .select('ManuallyProcessedAmount')
          .where('ClaimId', claimId)
          .then(function (result) {
            expect(result[0].ManuallyProcessedAmount, 'manually processed amount should equal 12').to.equal(12)
          })
      })
  })

  after(function () {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
  })
})
