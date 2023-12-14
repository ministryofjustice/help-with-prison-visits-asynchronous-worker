const expect = require('chai').expect
const isClaimTotalUnderLimit = require('../../../../../app/services/auto-approval/checks/is-claim-total-under-limit')

const validAutoApprovalData = {
  Claim: {
    Reference: 'ABC123'
  },
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

const invalidAutoApprovalData = {
  Claim: {
    Reference: 'ABC123'
  },
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
    const checkResult = isClaimTotalUnderLimit(invalidAutoApprovalData)
    expect(checkResult.result).to.equal(false)
    expect(checkResult.failureMessage).to.equal('The total claim value is over the maximum permitted amount. Claim ref: ABC123, Total claim: 300, Maximum permitted amount: 250')
  })

  it('should return true if claim total is less than the max claim total', function () {
    const checkResult = isClaimTotalUnderLimit(validAutoApprovalData)
    expect(checkResult.result).to.equal(true)
  })
})
