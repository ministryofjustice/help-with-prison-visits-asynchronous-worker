const expect = require('chai').expect
const config = require('../../../../knexfile').asyncworker
const knex = require('knex')(config)
const testHelper = require('../../../test-helper')

const updateClaimsProcessedPayment = require('../../../../app/services/data/update-claims-processed-payment')
const processedStatus = 'PROCESSED'

describe('services/data/update-claims-processed-payment', function () {
  var referenceA = 'PR123A'
  var referenceB = 'PR123B'

  beforeEach(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', referenceA)
    .then(function () {
      return testHelper.insertClaimEligibilityData('IntSchema', referenceB)
    })
  })

  it('should update Claim Payment Status to processed for all references', function () {
    return updateClaimsProcessedPayment([referenceA, referenceB])
      .then(function () {
        return knex('IntSchema.Claim').whereIn('Reference', [referenceA, referenceB])
          .then(function (claims) {
            expect(claims[0].PaymentStatus).to.be.equal(processedStatus)
            expect(claims[1].PaymentStatus).to.be.equal(processedStatus)
          })
      })
  })

  after(function () {
    return testHelper.deleteAll(referenceA, 'IntSchema')
      .then(function () {
        return testHelper.deleteAll(referenceB, 'IntSchema')
      })
  })
})
