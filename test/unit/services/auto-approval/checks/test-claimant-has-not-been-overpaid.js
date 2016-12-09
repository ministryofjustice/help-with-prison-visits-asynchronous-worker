const expect = require('chai').expect

const claimantHasNotBeenOverpaid = require('../../../../../app/services/auto-approval/checks/claimant-has-not-been-overpaid')

var autoApprovalDataWithNoOverpaidClaim = {
  previousClaims: [
    {
      IsAdvanceClaim: true,
      IsOverpaid: false
    }
  ]
}

var autoApprovalDataWithOverpaidClaim = {
  previousClaims: [
    {
      IsAdvanceClaim: true,
      IsOverpaid: false
    },
    {
      IsAdvanceClaim: true,
      IsOverpaid: true
    }
  ]
}

var autoApprovalDataNoPreviousClaims = {
  previousClaims: []
}

describe('services/auto-approval/checks/claimant-has-not-been-overpaid', function () {
  it('should return true if claimant has no overpaid previous claims', function () {
    var checkResult = claimantHasNotBeenOverpaid(autoApprovalDataWithNoOverpaidClaim)
    expect(checkResult.result).to.equal(true)
  })

  it('should return false if claimant has an overpaid previous claims', function () {
    var checkResult = claimantHasNotBeenOverpaid(autoApprovalDataWithOverpaidClaim)
    expect(checkResult.result).to.equal(false)
  })

  it('should return true if claimant has no previous claims', function () {
    var checkResult = claimantHasNotBeenOverpaid(autoApprovalDataNoPreviousClaims)
    expect(checkResult.result).to.equal(true)
  })
})
