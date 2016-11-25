const expect = require('chai').expect
const isLatestManualClaimApproved = require('../../../../app/services/auto-approval/checks/is-latest-manual-claim-approved')

const approvedClaim = {
  latestManuallyApprovedClaim: {
    Status: 'APPROVED'
  }
}

const notApprovedClaim = {
  latestManuallyApprovedClaim: {
    Status: 'FAILED'
  }
}

const noPreviousFirstTimeClaim = {
  latestManuallyApprovedClaim: null
}

describe('services/auto-approval/checks/is-latest-manual-claim-approved', function () {
  it('should return true if the status of the first time claim is approved', function () {
    var check = isLatestManualClaimApproved(approvedClaim)
    expect(check.result).to.equal(true)
  })

  it('should return false if the status of the first time claim is not approved', function () {
    var check = isLatestManualClaimApproved(notApprovedClaim)
    expect(check.result).to.equal(false)
  })

  it('should return false if there is no previous first time claim', function () {
    var check = isLatestManualClaimApproved(noPreviousFirstTimeClaim)
    expect(check.result).to.equal(false)
  })
})
