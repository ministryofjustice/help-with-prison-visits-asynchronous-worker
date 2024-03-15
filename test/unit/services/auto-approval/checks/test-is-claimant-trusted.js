const isClaimantTrusted = require('../../../../../app/services/auto-approval/checks/is-claimant-trusted')

const autoApprovalDataTrusted = {
  Eligibility: {
    IsTrusted: true
  }
}

const autoApprovalDataUntrusted = {
  Eligibility: {
    IsTrusted: false
  }
}

describe('services/auto-approval/checks/is-claimant-trusted', function () {
  it('should return true if claimant is marked as trusted', function () {
    const checkResult = isClaimantTrusted(autoApprovalDataTrusted)
    expect(checkResult.result).toBe(true)
  })

  it('should return false if claimant is marked as untrusted', function () {
    const checkResult = isClaimantTrusted(autoApprovalDataUntrusted)
    expect(checkResult.result).toBe(false)
  })
})
