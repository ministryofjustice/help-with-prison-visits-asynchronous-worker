const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const expect = require('chai').expect
const testHelper = require('../../../test-helper')
const updateClaimTotalAmount = require('../../../../app/services/data/update-claim-total-amount')
describe('services/data/update-claim-total-amount', function () {
  const REFERENCE = 'UPDATE12'
  let claimId
  before(function () {
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
            expect(result[0].TotalAmount, 'total amount should equal 12').to.equal(12)
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
            expect(result[0].TotalAmount, 'total amount should equal 12.12').to.equal(12.10)
          })
      })
  })

  after(function () {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
  })
})
