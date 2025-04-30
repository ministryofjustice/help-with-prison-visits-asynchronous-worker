const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const testHelper = require('../../../test-helper')
const dateFormatter = require('../../../../app/services/date-formatter')

const updateClaimsProcessedPayment = require('../../../../app/services/data/update-claims-processed-payment')

const processedStatus = 'PROCESSED'
let paymentTotal = 20
let paymentDate

describe('services/data/update-claims-processed-payment', () => {
  // TODO update to test methods processes multiple claim by ClaimId not Reference
  const referenceA = 'PROCESS'
  let claimId

  beforeAll(() => {
    paymentDate = dateFormatter.now().toDate()
    return testHelper.insertClaimEligibilityData('IntSchema', referenceA).then(ids => {
      claimId = ids.claimId
    })
  })

  it('should update Claim Payment Status to processed and Payment Amount to the total of approved claim expenses for all references', () => {
    return updateClaimsProcessedPayment(claimId, paymentTotal, paymentDate).then(() => {
      const db = getDatabaseConnector()

      return db('IntSchema.Claim')
        .where('ClaimId', claimId)
        .then(claims => {
          expect(claims[0].PaymentStatus).toBe(processedStatus)
          expect(claims[0].PaymentAmount).toBe(paymentTotal)
          expect(claims[0].PaymentDate).not.toBeNull()
        })
    })
  })

  it('should update Claim Payment Status to processed and Payment Amount to the total of approved claim expenses for decimal values', () => {
    paymentTotal = 7.5
    return updateClaimsProcessedPayment(claimId, paymentTotal).then(() => {
      const db = getDatabaseConnector()

      return db('IntSchema.Claim')
        .where('ClaimId', claimId)
        .then(claims => {
          expect(claims[0].PaymentStatus).toBe(processedStatus)
          expect(claims[0].PaymentAmount).toBe(paymentTotal)
        })
    })
  })

  afterAll(() => {
    return testHelper.deleteAll(referenceA, 'IntSchema')
  })
})
