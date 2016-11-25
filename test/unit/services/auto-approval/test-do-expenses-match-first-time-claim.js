const expect = require('chai').expect

var autoApprovalData = {
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

const doExpensesMatchFirstTimeClaim = require('../../../../app/services/auto-approval/checks/do-expenses-match-first-time-claim')

describe('services/auto-approval/checks/do-expenses-match-first-time-claim', function () {
  it('should return false if the number of expenses of the same type exceeds the number of expenses for the same type in the first time claim', function () {
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
        ClaimExpenseId: 800000007,
        ClaimId: 798118113,
        ExpenseType: 'bus',
        Cost: 10
      },
      {
        ClaimExpenseId: 800000008,
        ClaimId: 798118113,
        ExpenseType: 'bus',
        Cost: 15
      },
      {
        ClaimExpenseId: 800000009,
        ClaimId: 798118113,
        ExpenseType: 'train',
        Cost: 22
      },
      {
        ClaimExpenseId: 800000010,
        ClaimId: 798118113,
        ExpenseType: 'light refreshment',
        Cost: 5
      }
    ]

    var checkResult = doExpensesMatchFirstTimeClaim(autoApprovalData)
    expect(checkResult.result).to.equal(false)
  })

  it('should return false if claim types of the current claim don\'t exist in the first time claim expenses', function () {
    autoApprovalData.ClaimExpenses = [
      {
        ClaimExpenseId: 800000005,
        ClaimId: 798118113,
        ExpenseType: 'taxi',
        Cost: 50
      },
      {
        ClaimExpenseId: 800000006,
        ClaimId: 798118113,
        ExpenseType: 'bus',
        Cost: 13
      },
      {
        ClaimExpenseId: 800000007,
        ClaimId: 798118113,
        ExpenseType: 'bus',
        Cost: 10
      },
      {
        ClaimExpenseId: 800000009,
        ClaimId: 798118113,
        ExpenseType: 'train',
        Cost: 22
      },
      {
        ClaimExpenseId: 800000010,
        ClaimId: 798118113,
        ExpenseType: 'light refreshment',
        Cost: 5
      }
    ]

    var checkResult = doExpensesMatchFirstTimeClaim(autoApprovalData)
    expect(checkResult.result).to.equal(false)
  })

  it('should return true if the number of expenses of the same type is less or equal than the number of expenses for the same type in the first time claim', function () {
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
        ClaimExpenseId: 800000009,
        ClaimId: 798118113,
        ExpenseType: 'train',
        Cost: 22
      },
      {
        ClaimExpenseId: 800000010,
        ClaimId: 798118113,
        ExpenseType: 'light refreshment',
        Cost: 5
      }
    ]

    var checkResult = doExpensesMatchFirstTimeClaim(autoApprovalData)
    expect(checkResult.result).to.equal(true)
  })

  it('should return false if there is no first time claim expenses', function () {
    autoApprovalData.latestManuallyApprovedClaim.claimExpenses = []

    var checkResult = doExpensesMatchFirstTimeClaim(autoApprovalData)
    expect(checkResult.result).to.equal(false)
  })
})
