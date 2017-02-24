const expect = require('chai').expect
const config = require('../../../../knexfile').asyncworker
const knex = require('knex')(config)
const testHelper = require('../../../test-helper')

const updateClaimsProcessedPayment = require('../../../../app/services/data/update-claims-processed-payment')
const processedStatus = 'PROCESSED'
var paymentTotal = 20

describe('services/data/update-claims-processed-payment', function () {
  // TODO update to test methods processes multiple claim by ClaimId not Reference
  var referenceA = 'PROCESS'
  var claimId

  before(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', referenceA)
      .then(function (ids) {
        claimId = ids.claimId
      })
  })

  it('should update Claim Payment Status to processed and Payment Amount to the total of approved claim expenses for all references', function () {
    return updateClaimsProcessedPayment(claimId, paymentTotal)
      .then(function () {
        return knex('IntSchema.Claim').where('ClaimId', claimId)
          .then(function (claims) {
            expect(claims[0].PaymentStatus).to.be.equal(processedStatus)
            expect(claims[0].PaymentAmount).to.be.equal(paymentTotal)
          })
      })
  })

  it('should update Claim Payment Status to processed and Payment Amount to the total of approved claim expenses for decimal values', function () {
    paymentTotal = 7.50
    return updateClaimsProcessedPayment(claimId, paymentTotal)
      .then(function () {
        return knex('IntSchema.Claim').where('ClaimId', claimId)
          .then(function (claims) {
            expect(claims[0].PaymentStatus).to.be.equal(processedStatus)
            expect(claims[0].PaymentAmount).to.be.equal(paymentTotal)
          })
      })
  })

  after(function () {
    return testHelper.deleteAll(referenceA, 'IntSchema')
  })
})
