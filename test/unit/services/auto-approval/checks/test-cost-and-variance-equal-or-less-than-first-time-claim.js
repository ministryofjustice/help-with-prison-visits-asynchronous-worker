const autoApprovalData = {
  Claim: {
    Reference: 'ABC123',
  },
  latestManuallyApprovedClaim: {
    claimExpenses: [
      {
        ExpenseType: 'plane',
        ApprovedCost: 100,
      },
      {
        ExpenseType: 'bus',
        ApprovedCost: 10,
      },
      {
        ExpenseType: 'bus',
        ApprovedCost: 15,
      },
      {
        ExpenseType: 'train',
        ApprovedCost: 20,
      },
      {
        ExpenseType: 'light refreshment',
        ApprovedCost: 5,
      },
    ],
  },
  costVariancePercentage: '-10',
}

const costAndVarianceEqualOrLessThanFirstTimeClaim = require('../../../../../app/services/auto-approval/checks/cost-and-variance-equal-or-less-than-first-time-claim')

describe('services/auto-approval/checks/cost-and-variance-equal-or-less-than-first-time-claim', function () {
  it('should return true if the total cost for each expense type is within the accepted variance (10%)', function () {
    autoApprovalData.ClaimExpenses = [
      {
        ExpenseType: 'plane',
        Cost: 100,
      },
      {
        ExpenseType: 'bus',
        Cost: 23,
      },
      {
        ExpenseType: 'train',
        Cost: 22,
      },
      {
        ExpenseType: 'light refreshment',
        Cost: 5,
      },
    ]

    const checkResult = costAndVarianceEqualOrLessThanFirstTimeClaim(autoApprovalData)
    expect(checkResult.result).toBe(true)
  })

  it('should return false if the total cost of any expense type is outside the accepted variance (10%)', function () {
    autoApprovalData.ClaimExpenses = [
      {
        ExpenseType: 'plane',
        Cost: 115,
      },
      {
        ExpenseType: 'bus',
        Cost: 23,
      },
      {
        ExpenseType: 'train',
        Cost: 22,
      },
      {
        ExpenseType: 'light refreshment',
        Cost: 5,
      },
    ]

    const checkResult = costAndVarianceEqualOrLessThanFirstTimeClaim(autoApprovalData)
    expect(checkResult.result).toBe(false)
    expect(checkResult.failureMessage).toBe(
      'Claim expense costs are outside of the accepted variance from the last manually approved claim. Claim ref: ABC123, Current expense type total: 115, Upper threshold: 110, Lower threshold: 90',
    )
  })
})
