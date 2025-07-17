const claimantHasNotBeenOverpaid = require('../../../../../app/services/auto-approval/checks/claimant-has-not-been-overpaid')

const autoApprovalDataWithNoOverpaidClaim = {
  previousClaims: [
    {
      IsOverpaid: false,
    },
  ],
}

const autoApprovalDataWithOverpaidClaim = {
  previousClaims: [
    {
      IsOverpaid: false,
    },
    {
      IsOverpaid: true,
    },
  ],
}

const autoApprovalDataNoPreviousClaims = {
  previousClaims: [],
}

describe('services/auto-approval/checks/claimant-has-not-been-overpaid', () => {
  it('should return true if claimant has no overpaid previous claims', () => {
    const checkResult = claimantHasNotBeenOverpaid(autoApprovalDataWithNoOverpaidClaim)
    expect(checkResult.result).toBe(true)
  })

  it('should return false if claimant has an overpaid previous claims', () => {
    const checkResult = claimantHasNotBeenOverpaid(autoApprovalDataWithOverpaidClaim)
    expect(checkResult.result).toBe(false)
  })

  it('should return true if claimant has no previous claims', () => {
    const checkResult = claimantHasNotBeenOverpaid(autoApprovalDataNoPreviousClaims)
    expect(checkResult.result).toBe(true)
  })
})
