const expect = require('chai').expect
const testHelper = require('../../../test-helper')
const moment = require('moment')

const getAdvanceClaimsTotalExpenseApprovedCostBeforeDate = require('../../../../app/services/data/get-advance-claims-total-expense-approved-cost-before-date')

describe('services/data/get-advance-claims-total-expense-approved-cost-before-date', function () {
  const REFERENCE = 'AMOUNTO'
  var claimId
  var date = moment().add('1', 'd').toDate()
  var amount

  before(function () {
    var data = testHelper.getClaimData(REFERENCE)
    amount = data.ClaimExpenses[0].ApprovedCost + data.ClaimExpenses[1].ApprovedCost
    return testHelper.insertClaimEligibilityData('IntSchema', REFERENCE, 'TESTING')
      .then(function (ids) {
        claimId = ids.claimId
      })
  })

  it('should get all advance claims before specifed date with status', function () {
    return getAdvanceClaimsTotalExpenseApprovedCostBeforeDate(date, 'TESTING')
      .then(function (claims) {
        expect(claims[0].ClaimId).to.be.equal(claimId)
        expect(claims[0].Reference).to.be.equal(REFERENCE)
        expect(claims[0].Amount).to.be.equal(amount)
      })
  })

  after(function () {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
  })
})
