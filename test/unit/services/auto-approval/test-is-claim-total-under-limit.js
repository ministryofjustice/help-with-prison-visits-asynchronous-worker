const expect = require('chai').expect
const isClaimTotalUnderLimit = require('../../../../app/services/auto-approval/checks/is-claim-total-under-limit')

var validAutoApprovalData = {
  ClaimExpenses: [
    { ClaimExpenseId: 798118115,
      EligibilityId: 798118115,
      Reference: 'AUTOAPP',
      ClaimId: 798118115,
      ExpenseType: 'car',
      Cost: 0 },
    { ClaimExpenseId: 798118116,
      EligibilityId: 798118115,
      Reference: 'AUTOAPP',
      ClaimId: 798118115,
      ExpenseType: 'bus',
      Cost: 20
    }
  ]
}

var invalidAutoApprovalData = {
  ClaimExpenses: [
    { ClaimExpenseId: 798118115,
      EligibilityId: 798118115,
      Reference: 'AUTOAPP',
      ClaimId: 798118115,
      ExpenseType: 'plane',
      Cost: 150 },
    { ClaimExpenseId: 798118116,
      EligibilityId: 798118115,
      Reference: 'AUTOAPP',
      ClaimId: 798118115,
      ExpenseType: 'train',
      Cost: 150
    }
  ]
}

describe('services/auto-approval/checks/is-claim-total-under-limit', function () {
  it('should return false if claim total exceeds the max claim total', function () {
    var checkResult = isClaimTotalUnderLimit(invalidAutoApprovalData)
    expect(checkResult.result).to.equal(false)
  })

  it('should return true if claim total is less than the max claim total', function () {
    var checkResult = isClaimTotalUnderLimit(validAutoApprovalData)
    expect(checkResult.result).to.equal(true)
  })
})
