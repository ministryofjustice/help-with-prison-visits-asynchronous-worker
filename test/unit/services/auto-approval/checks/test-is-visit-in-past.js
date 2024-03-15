const dateFormatter = require('../../../../../app/services/date-formatter')
const isVisitInPast = require('../../../../../app/services/auto-approval/checks/is-visit-in-past')

const autoApprovalDataWithPastClaim = {
  Claim: {
    ClaimId: 1,
    DateOfJourney: dateFormatter.now().subtract(1, 'days')
  }
}

const autoApprovalDataWithFutureClaim = {
  Claim: {
    ClaimId: 1,
    DateOfJourney: dateFormatter.now().add(1, 'days')
  }
}

describe('services/auto-approval/checks/is-visit-in-past', function () {
  it('should return true if the visit date of the current claim is in the past', function () {
    const checkResult = isVisitInPast(autoApprovalDataWithPastClaim)
    expect(checkResult.result).toBe(true)
  })

  it('should return false if the visit date of the current claim is in the future', function () {
    const checkResult = isVisitInPast(autoApprovalDataWithFutureClaim)
    expect(checkResult.result).toBe(false)
  })
})
