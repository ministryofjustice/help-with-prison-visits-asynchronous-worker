const expect = require('chai').expect
const isReleaseDateSet = require('../../../../../app/services/auto-approval/checks/is-release-date-set')

const autoApprovalDataReleaseDateSet = {
  Prisoner: {
    ReleaseDateIsSet: true
  }
}

const autoApprovalDataReleaseDateSetFalse = {
  Prisoner: {
    ReleaseDateIsSet: false
  }
}

const autoApprovalDataReleaseDateSetNull = {
  Prisoner: {
    ReleaseDateIsSet: null
  }
}

describe('services/auto-approval/checks/is-visit-in-past', function () {
  it('should return true if the ReleaseDateIsSet variable is true', function () {
    const checkResult = isReleaseDateSet(autoApprovalDataReleaseDateSet)
    expect(checkResult.result).to.equal(true)
  })

  it('should return false if the ReleaseDateIsSet variable is false', function () {
    const checkResult = isReleaseDateSet(autoApprovalDataReleaseDateSetFalse)
    expect(checkResult.result).to.equal(false)
  })

  it('should return false if the ReleaseDateIsSet variable is null', function () {
    const checkResult = isReleaseDateSet(autoApprovalDataReleaseDateSetNull)
    expect(checkResult.result).to.equal(false)
  })
})
