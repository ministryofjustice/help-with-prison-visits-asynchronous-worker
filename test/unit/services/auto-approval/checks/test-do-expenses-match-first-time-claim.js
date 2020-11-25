const expect = require('chai').expect

const autoApprovalData = {
  latestManuallyApprovedClaim: {
    claimExpenses: [
      {
        ExpenseType: 'plane'
      },
      {
        ExpenseType: 'bus'
      },
      {
        ExpenseType: 'bus'
      },
      {
        ExpenseType: 'train'
      },
      {
        ExpenseType: 'light refreshment'
      }
    ]
  }
}

const doExpensesMatchFirstTimeClaim = require('../../../../../app/services/auto-approval/checks/do-expenses-match-first-time-claim')

describe('services/auto-approval/checks/do-expenses-match-first-time-claim', function () {
  it('should return false if the number of expenses of the same type exceeds the number of expenses for the same type in the first time claim', function () {
    autoApprovalData.ClaimExpenses = [
      {
        ExpenseType: 'plane'
      },
      {
        ExpenseType: 'bus'
      },
      {
        ExpenseType: 'bus'
      },
      {
        ExpenseType: 'bus'
      },
      {
        ExpenseType: 'train'
      },
      {
        ExpenseType: 'light refreshment'
      }
    ]

    const checkResult = doExpensesMatchFirstTimeClaim(autoApprovalData)
    expect(checkResult.result).to.equal(false)
  })

  it('should return false if claim types of the current claim don\'t exist in the first time claim expenses', function () {
    autoApprovalData.ClaimExpenses = [
      {
        ExpenseType: 'taxi'
      },
      {
        ExpenseType: 'bus'
      },
      {
        ExpenseType: 'bus'
      },
      {
        ExpenseType: 'train'
      },
      {
        ExpenseType: 'light refreshment'
      }
    ]

    const checkResult = doExpensesMatchFirstTimeClaim(autoApprovalData)
    expect(checkResult.result).to.equal(false)
  })

  it('should return true if the number of expenses of the same type is less or equal than the number of expenses for the same type in the first time claim', function () {
    autoApprovalData.ClaimExpenses = [
      {
        ExpenseType: 'plane'
      },
      {
        ExpenseType: 'bus'
      },
      {
        ExpenseType: 'train'
      },
      {
        ExpenseType: 'light refreshment'
      }
    ]

    const checkResult = doExpensesMatchFirstTimeClaim(autoApprovalData)
    expect(checkResult.result).to.equal(true)
  })

  it('should return false if there is no first time claim expenses', function () {
    autoApprovalData.latestManuallyApprovedClaim.claimExpenses = []

    const checkResult = doExpensesMatchFirstTimeClaim(autoApprovalData)
    expect(checkResult.result).to.equal(false)
  })
})
