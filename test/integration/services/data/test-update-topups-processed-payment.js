const expect = require('chai').expect
const config = require('../../../../knexfile').asyncworker
const knex = require('knex')(config)
const testHelper = require('../../../test-helper')
const moment = require('moment')

const updateTopupsPendingPayment = require('../../../../app/services/data/update-topups-processed-payment')
const getTopUpsPendingPayment = require('../../../../app/services/data/get-topups-pending-payment')
const paymentMethods = require('../../../../app/constants/payment-method-enum')

const processedStatus = 'PROCESSED'
const paymentDate = moment().format('YYYY-MM-DD HH:mm:ss.SSS')

describe('services/data/update-topups-processed-payment', function () {
  // TODO update to test methods processes multiple claim by ClaimId not Reference
  const referenceA = 'PROCESS'
  let claimId

  before(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', referenceA)
      .then(function (ids) {
        claimId = ids.claimId
        return testHelper.insertTopUp(claimId)
      })
  })

  it(`should update Topup PaymentStatus to PROCESSED and set PaymentDate to ${paymentDate}`, function () {
    return getTopUpsPendingPayment(paymentMethods.DIRECT_BANK_PAYMENT.value)
      .then(function (topupsPendingPayment) {
        expect(topupsPendingPayment.length, 'Topups pending payment should be an array of size 1').to.be.equal(1)
        return updateTopupsPendingPayment(claimId, paymentDate)
          .then(function () {
            return knex('IntSchema.TopUp').where('ClaimId', claimId)
              .then(function (claims) {
                expect(claims[0].PaymentStatus).to.be.equal(processedStatus)
                expect(claims[0].PaymentDate).to.not.equal(null)
                return getTopUpsPendingPayment(paymentMethods.DIRECT_BANK_PAYMENT.value)
                  .then(function (topupsPendingPayment) {
                    expect(topupsPendingPayment.length, 'Topups pending payment should be an array of size 0').to.be.equal(0)
                  })
              })
          })
      })
  })

  after(function () {
    return testHelper.deleteTopUp(claimId)
      .then(function () {
        return testHelper.deleteAll(referenceA, 'IntSchema')
      })
  })
})
