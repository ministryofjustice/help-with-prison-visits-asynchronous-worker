const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const testHelper = require('../../../test-helper')
const dateFormatter = require('../../../../app/services/date-formatter')

const updateClaimsProcessedPayment = require('../../../../app/services/data/update-claims-processed-payment')

const processedStatus = 'PROCESSED'
let paymentTotal = 20
let paymentDate

describe('services/data/update-claims-processed-payment', function () {
  // TODO update to test methods processes multiple claim by ClaimId not Reference
  const referenceA = 'PROCESS'
  let claimId

  beforeAll(function () {
    paymentDate = dateFormatter.now().toDate()
    return testHelper.insertClaimEligibilityData('IntSchema', referenceA).then(function (ids) {
      claimId = ids.claimId
    })
  })

  it('should update Claim Payment Status to processed and Payment Amount to the total of approved claim expenses for all references', function () {
    return updateClaimsProcessedPayment(claimId, paymentTotal, paymentDate).then(function () {
      const db = getDatabaseConnector()

      return db('IntSchema.Claim')
        .where('ClaimId', claimId)
        .then(function (claims) {
          expect(claims[0].PaymentStatus).toBe(processedStatus)
          expect(claims[0].PaymentAmount).toBe(paymentTotal)
          expect(claims[0].PaymentDate).not.toBeNull()
        })
    })
  })

  it('should update Claim Payment Status to processed and Payment Amount to the total of approved claim expenses for decimal values', function () {
    paymentTotal = 7.5
    return updateClaimsProcessedPayment(claimId, paymentTotal).then(function () {
      const db = getDatabaseConnector()

      return db('IntSchema.Claim')
        .where('ClaimId', claimId)
        .then(function (claims) {
          expect(claims[0].PaymentStatus).toBe(processedStatus)
          expect(claims[0].PaymentAmount).toBe(paymentTotal)
        })
    })
  })

  afterAll(function () {
    return testHelper.deleteAll(referenceA, 'IntSchema')
  })
})
