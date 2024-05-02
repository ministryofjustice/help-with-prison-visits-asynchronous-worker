const isLatestManualClaimApproved = require('../../../../../app/services/auto-approval/checks/is-latest-manual-claim-approved')

const approvedClaim = {
  latestManuallyApprovedClaim: {
    Status: 'APPROVED',
  },
  latestManualClaim: {
    Status: 'APPROVED',
  },
}

const notApprovedClaim = {
  latestManuallyApprovedClaim: {
    Status: 'FAILED',
  },
  latestManualClaim: {
    Status: 'REJECTED',
  },
}

const noPreviousFirstTimeClaim = {
  latestManuallyApprovedClaim: null,
  latestManualClaim: null,
}

describe('services/auto-approval/checks/is-latest-manual-claim-approved', function () {
  it('should return true if the status of the first time claim is approved', function () {
    const check = isLatestManualClaimApproved(approvedClaim)
    expect(check.result).toBe(true)
  })

  it('should return false if the status of the first time claim is not approved', function () {
    const check = isLatestManualClaimApproved(notApprovedClaim)
    expect(check.result).toBe(false)
  })

  it('should return false if there is no previous first time claim', function () {
    const check = isLatestManualClaimApproved(noPreviousFirstTimeClaim)
    expect(check.result).toBe(false)
  })
})
