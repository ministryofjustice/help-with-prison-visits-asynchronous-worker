const expect = require('chai').expect
const moment = require('moment')
const isVisitInPast = require('../../../../../app/services/auto-approval/checks/is-visit-in-past')

var autoApprovalDataWithPastClaim = {
  Claim: {
    ClaimId: 1,
    DateOfJourney: moment().subtract(1, 'days')
  }
}

var autoApprovalDataWithFutureClaim = {
  Claim: {
    ClaimId: 1,
    DateOfJourney: moment().add(1, 'days')
  }
}

describe('services/auto-approval/checks/is-visit-in-past', function () {
  it('should return true if the visit date of the current claim is in the past', function () {
    var checkResult = isVisitInPast(autoApprovalDataWithPastClaim)
    expect(checkResult.result).to.equal(true)
  })

  it('should return false if the visit date of the current claim is in the future', function () {
    var checkResult = isVisitInPast(autoApprovalDataWithFutureClaim)
    expect(checkResult.result).to.equal(false)
  })
})
