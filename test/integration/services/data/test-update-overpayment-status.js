const expect = require('chai').expect
const config = require('../../../../knexfile').asyncworker
const knex = require('knex')(config)
const testHelper = require('../../../test-helper')

const updateOverpaymentStatus = require('../../../../app/services/data/update-overpayment-status')

const AMOUNT = 100
const REFERENCE = 'OVERPAY'
var claimId

describe('services/data/update-overpayment-status', function () {
  beforeEach(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', REFERENCE)
      .then(function (ids) {
        claimId = ids.claimId
      })
  })

  it('should update Claim IsOverpaid to true and with the amount added', function () {
    return updateOverpaymentStatus(claimId, REFERENCE, AMOUNT)
      .then(function () {
        return knex('IntSchema.Claim').where('ClaimId', claimId).first()
          .then(function (claim) {
            expect(claim.IsOverpaid).to.be.true
            expect(claim.OverpaymentAmount).to.equal(AMOUNT)
            expect(claim.RemainingOverpaymentAmount).to.equal(AMOUNT)
            expect(claim.OverpaymentReason).to.equal('Evidence not uploaded within 10 days')
          })
      })
  })

  afterEach(function () {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
  })
})
