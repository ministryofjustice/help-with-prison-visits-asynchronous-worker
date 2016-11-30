const expect = require('chai').expect
const config = require('../../../../knexfile').asyncworker
const knex = require('knex')(config)
const testHelper = require('../../../test-helper')

const updateClaimsProcessedPayment = require('../../../../app/services/data/update-claims-processed-payment')
const processedStatus = 'PROCESSED'

describe('services/data/update-claims-processed-payment', function () {
  // TODO update to test methods processes multiple claim by ClaimId not Reference
  var referenceA = 'PR123A'

  beforeEach(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', referenceA)
  })

  it('should update Claim Payment Status to processed for all references', function () {
    return updateClaimsProcessedPayment([referenceA])
      .then(function () {
        return knex('IntSchema.Claim').whereIn('Reference', [referenceA])
          .then(function (claims) {
            expect(claims[0].PaymentStatus).to.be.equal(processedStatus)
          })
      })
  })

  after(function () {
    return testHelper.deleteAll(referenceA, 'IntSchema')
  })
})
