const expect = require('chai').expect

const autoApprovalData = {
  latestManuallyApprovedClaim: {
    claimExpenses: [
      {
        ClaimExpenseId: 800000000,
        ClaimId: 798118115,
        ExpenseType: 'plane',
        Cost: 100
      },
      {
        ClaimExpenseId: 800000001,
        ClaimId: 798118115,
        ExpenseType: 'bus',
        Cost: 10
      },
      {
        ClaimExpenseId: 800000002,
        ClaimId: 798118115,
        ExpenseType: 'bus',
        Cost: 15
      },
      {
        ClaimExpenseId: 800000003,
        ClaimId: 798118115,
        ExpenseType: 'train',
        Cost: 20
      },
      {
        ClaimExpenseId: 800000004,
        ClaimId: 798118115,
        ExpenseType: 'light refreshment',
        Cost: 5
      }
    ]
  }
}

const costAndVarianceEqualOrLessThanFirstTimeClaim = require('../../../../app/services/auto-approval/checks/cost-and-variance-equal-or-less-than-first-time-claim')

describe('services/auto-approval/checks/cost-and-variance-equal-or-less-than-first-time-claim', function () {
  it('should return true if the total cost for each expense type is within the accepted variance (10%)', function () {
    autoApprovalData.ClaimExpenses = [
      {
        ClaimExpenseId: 800000005,
        ClaimId: 798118113,
        ExpenseType: 'plane',
        Cost: 100
      },
      {
        ClaimExpenseId: 800000006,
        ClaimId: 798118113,
        ExpenseType: 'bus',
        Cost: 23
      },
      {
        ClaimExpenseId: 800000008,
        ClaimId: 798118113,
        ExpenseType: 'train',
        Cost: 22
      },
      {
        ClaimExpenseId: 800000009,
        ClaimId: 798118113,
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
        ClaimExpenseId: 800000005,
        ClaimId: 798118113,
        ExpenseType: 'plane',
        Cost: 115
      },
      {
        ClaimExpenseId: 800000006,
        ClaimId: 798118113,
        ExpenseType: 'bus',
        Cost: 23
      },
      {
        ClaimExpenseId: 800000008,
        ClaimId: 798118113,
        ExpenseType: 'train',
        Cost: 22
      },
      {
        ClaimExpenseId: 800000009,
        ClaimId: 798118113,
        ExpenseType: 'light refreshment',
        Cost: 5
      }
    ]

    var checkResult = costAndVarianceEqualOrLessThanFirstTimeClaim(autoApprovalData)
    expect(checkResult.result).to.equal(false)
  })
})
