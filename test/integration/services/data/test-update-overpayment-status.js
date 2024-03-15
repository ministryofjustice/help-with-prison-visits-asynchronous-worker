const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const testHelper = require('../../../test-helper')

const updateOverpaymentStatus = require('../../../../app/services/data/update-overpayment-status')

const AMOUNT = 100
const REFERENCE = 'OVERPAY'
let claimId

describe('services/data/update-overpayment-status', function () {
  beforeEach(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', REFERENCE)
      .then(function (ids) {
        claimId = ids.claimId
      })
  })

  it('should update Claim IsOverpaid to true and with the amount added', function () {
    return updateOverpaymentStatus(claimId, REFERENCE, AMOUNT, '10')
      .then(function () {
        const db = getDatabaseConnector()

        return db('IntSchema.Claim').where('ClaimId', claimId).first()
          .then(function (claim) {
            expect(claim.IsOverpaid).toBe(true) //eslint-disable-line
            expect(claim.OverpaymentAmount).toBe(AMOUNT)
            expect(claim.RemainingOverpaymentAmount).toBe(AMOUNT)
            expect(claim.OverpaymentReason).toBe('Evidence not uploaded within 10 days')
          });
      });
  })

  afterEach(function () {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
  })
})
