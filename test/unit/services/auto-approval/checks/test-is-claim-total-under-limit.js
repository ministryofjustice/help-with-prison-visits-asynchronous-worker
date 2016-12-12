const expect = require('chai').expect
const isClaimTotalUnderLimit = require('../../../../../app/services/auto-approval/checks/is-claim-total-under-limit')

var validAutoApprovalData = {
  ClaimExpenses: [
    {
      Cost: 0
    },
    {
      Cost: 20
    }
  ],
  maxClaimTotal: '250'
}

var invalidAutoApprovalData = {
  ClaimExpenses: [
    {
      Cost: 150
    },
    {
      Cost: 150
    }
  ],
  maxClaimTotal: '250'
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
