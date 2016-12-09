const expect = require('chai').expect

const autoApprovalData = {
  latestManuallyApprovedClaim: {
    claimExpenses: [
      {
        ExpenseType: 'plane',
        Cost: 100
      },
      {
        ExpenseType: 'bus',
        Cost: 10
      },
      {
        ExpenseType: 'bus',
        Cost: 15
      },
      {
        ExpenseType: 'train',
        Cost: 20
      },
      {
        ExpenseType: 'light refreshment',
        Cost: 5
      }
    ]
  },
  costVariancePercentage: '-10'
}

const costAndVarianceEqualOrLessThanFirstTimeClaim = require('../../../../../app/services/auto-approval/checks/cost-and-variance-equal-or-less-than-first-time-claim')

describe('services/auto-approval/checks/cost-and-variance-equal-or-less-than-first-time-claim', function () {
  it('should return true if the total cost for each expense type is within the accepted variance (10%)', function () {
    autoApprovalData.ClaimExpenses = [
      {
        ExpenseType: 'plane',
        Cost: 100
      },
      {
        ExpenseType: 'bus',
        Cost: 23
      },
      {
        ExpenseType: 'train',
        Cost: 22
      },
      {
        ExpenseType: 'light refreshment',
        Cost: 5
      }
    ]

    var checkResult = costAndVarianceEqualOrLessThanFirstTimeClaim(autoApprovalData)
    expect(checkResult.result).to.equal(true)
  })

  it('should return false if the total cost of any expense type is outside the accepted variance (10%)', function () {
    autoApprovalData.ClaimExpenses = [
      {
        ExpenseType: 'plane',
        Cost: 115
      },
      {
        ExpenseType: 'bus',
        Cost: 23
      },
      {
        ExpenseType: 'train',
        Cost: 22
      },
      {
        ExpenseType: 'light refreshment',
        Cost: 5
      }
    ]

    var checkResult = costAndVarianceEqualOrLessThanFirstTimeClaim(autoApprovalData)
    expect(checkResult.result).to.equal(false)
  })
})
