const expect = require('chai').expect

const isClaimantTrusted = require('../../../../../app/services/auto-approval/checks/is-claimant-trusted')

var autoApprovalDataTrusted = {
  Eligibility: {
    IsTrusted: true
  }
}

var autoApprovalDataUntrusted = {
  Eligibility: {
    IsTrusted: false
  }
}

describe('services/auto-approval/checks/is-claimant-trusted', function () {
  it('should return true if claimant is marked as trusted', function () {
    var checkResult = isClaimantTrusted(autoApprovalDataTrusted)
    expect(checkResult.result).to.equal(true)
  })

  it('should return false if claimant is marked as untrusted', function () {
    var checkResult = isClaimantTrusted(autoApprovalDataUntrusted)
    expect(checkResult.result).to.equal(false)
  })
})
