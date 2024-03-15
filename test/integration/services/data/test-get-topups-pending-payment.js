const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const testHelper = require('../../../test-helper')
const paymentMethods = require('../../../../app/constants/payment-method-enum')
const getTopUpsPendingPayment = require('../../../../app/services/data/get-topups-pending-payment')

describe('services/data/get-topups-pending-payment', function () {
  const reference = 'TOPUP'
  let claimId

  let expectedBankTopups
  let expectedVoucherTopups = [
    [1971804226, '22.66', 'Joe', 'Bloggs', '1', 'Town', 'County', 'Northern Ireland', 'AA123AA', 'TOPUP']
  ]
  function beforeDataCreation () {
    return testHelper.insertClaimEligibilityData('IntSchema', reference)
      .then(function (ids) {
        claimId = ids.claimId
        expectedBankTopups = [
          [claimId, '001122', '00123456', 'Joe Bloggs', '22.66', 'TOPUP', 'Northern Ireland', 'ROLL-1BE.R']
        ]
        expectedVoucherTopups = [
          [claimId, '22.66', 'Joe', 'Bloggs', '1', 'Town', 'County', 'Northern Ireland', 'AA123AA', 'TOPUP']
        ]
        return testHelper.insertTopUp(claimId)
      })
  }

  describe('Direct Bank payment', function () {
    beforeAll(function () {
      return beforeDataCreation()
    })

    it('should retrieve only topups with a PaymentStatus of PENDING and a PaymentDate of NULL', function () {
      return getTopUpsPendingPayment(paymentMethods.DIRECT_BANK_PAYMENT.value)
        .then(function (results) {
          expect(results).toEqual(expectedBankTopups)
        });
    })

    afterAll(function () {
      return testHelper.deleteTopUp(claimId)
        .then(function () {
          return testHelper.deleteAll(reference, 'IntSchema')
        })
    })
  })

  describe('Payout payments', function () {
    beforeAll(function () {
      const db = getDatabaseConnector()

      return beforeDataCreation()
        .then(function () {
          return db('IntSchema.Claim')
            .where('ClaimId', claimId)
            .update('PaymentMethod', paymentMethods.PAYOUT.value)
        })
        .then(function () {
          return db('IntSchema.ClaimBankDetail')
            .where('ClaimId', claimId)
            .del()
        })
    })
    it('should retrieve only APPROVED claim records with payment status of NULL', function () {
      return getTopUpsPendingPayment(paymentMethods.PAYOUT.value)
        .then(function (results) {
          const result = results.pop()
          results.push(result.slice(0, result.length - 1))
          expect(results).toEqual(expectedVoucherTopups)
        });
    })

    afterAll(function () {
      return testHelper.deleteTopUp(claimId)
        .then(function () {
          return testHelper.deleteAll(reference, 'IntSchema')
        })
    })
  })
})
