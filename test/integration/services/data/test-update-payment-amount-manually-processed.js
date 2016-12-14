const config = require('../../../../knexfile').asyncworker
const knex = require('knex')(config)
const testHelper = require('../../../test-helper')
const updateClaimTotalAmount = require('../../../../app/services/data/update-claim-total-amount')
describe('services/data/update-payment-amount-manually-processed', function () {
  const REFERENCE = 'UPDATE12'
  var claimId
  before(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', REFERENCE)
      .then(function (ids) {
        claimId = ids.claimId
      })
  })

  it('should update the manually processed column for a particular claim', function () {
    return updateClaimTotalAmount(claimId, '12')
      .then(function () {
        knex('IntSchema.Claim')
          .select('TotalAmount')
          .where('ClaimId', claimId)
      })
  })

  after(function () {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
  })
})
