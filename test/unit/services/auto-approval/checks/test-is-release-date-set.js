const expect = require('chai').expect
const isReleaseDateSet = require('../../../../../app/services/auto-approval/checks/is-release-date-set')

var autoApprovalDataReleaseDateSet = {
  Prisoner: {
    ReleaseDateIsSet: true
  }
}

var autoApprovalDataReleaseDateSetFalse = {
  Prisoner: {
    ReleaseDateIsSet: false
  }
}

var autoApprovalDataReleaseDateSetNull = {
  Prisoner: {
    ReleaseDateIsSet: null
  }
}

describe('services/auto-approval/checks/is-visit-in-past', function () {
  it('should return true if the ReleaseDateIsSet variable is true', function () {
    var checkResult = isReleaseDateSet(autoApprovalDataReleaseDateSet)
    expect(checkResult.result).to.equal(true)
  })

  it('should return false if the ReleaseDateIsSet variable is false', function () {
    var checkResult = isReleaseDateSet(autoApprovalDataReleaseDateSetFalse)
    expect(checkResult.result).to.equal(false)
  })

  it('should return false if the ReleaseDateIsSet variable is null', function () {
    var checkResult = isReleaseDateSet(autoApprovalDataReleaseDateSetNull)
    expect(checkResult.result).to.equal(false)
  })
})
