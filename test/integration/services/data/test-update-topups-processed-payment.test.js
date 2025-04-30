const moment = require('moment')
const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const testHelper = require('../../../test-helper')

const updateTopupsPendingPayment = require('../../../../app/services/data/update-topups-processed-payment')
const getTopUpsPendingPayment = require('../../../../app/services/data/get-topups-pending-payment')
const paymentMethods = require('../../../../app/constants/payment-method-enum')

const processedStatus = 'PROCESSED'
const paymentDate = moment().format('YYYY-MM-DD HH:mm:ss.SSS')

describe('services/data/update-topups-processed-payment', () => {
  // TODO update to test methods processes multiple claim by ClaimId not Reference
  const referenceA = 'PROCESS'
  let claimId

  beforeAll(() => {
    return testHelper.insertClaimEligibilityData('IntSchema', referenceA).then(ids => {
      claimId = ids.claimId
      return testHelper.insertTopUp(claimId)
    })
  })

  it(`should update Topup PaymentStatus to PROCESSED and set PaymentDate to ${paymentDate}`, () => {
    return getTopUpsPendingPayment(paymentMethods.DIRECT_BANK_PAYMENT.value).then(topupsPendingPayment => {
      // Topups pending payment should be an array of size 1
      expect(topupsPendingPayment.length).toBe(1)
      return updateTopupsPendingPayment(claimId, paymentDate).then(() => {
        const db = getDatabaseConnector()

        return db('IntSchema.TopUp')
          .where('ClaimId', claimId)
          .then(claims => {
            expect(claims[0].PaymentStatus).toBe(processedStatus)
            expect(claims[0].PaymentDate).not.toBeNull()
            return getTopUpsPendingPayment(paymentMethods.DIRECT_BANK_PAYMENT.value).then(
              topupsPendingPaymentReturn => {
                // Topups pending payment should be an array of size 0
                expect(topupsPendingPaymentReturn.length).toBe(0)
              },
            )
          })
      })
    })
  })

  afterAll(() => {
    return testHelper.deleteTopUp(claimId).then(() => {
      return testHelper.deleteAll(referenceA, 'IntSchema')
    })
  })
})
