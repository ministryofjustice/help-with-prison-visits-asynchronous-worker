const isReleaseDateSet = require('../../../../../app/services/auto-approval/checks/is-release-date-set')

const autoApprovalDataReleaseDateSet = {
  Prisoner: {
    ReleaseDateIsSet: true,
  },
}

const autoApprovalDataReleaseDateSetFalse = {
  Prisoner: {
    ReleaseDateIsSet: false,
  },
}

const autoApprovalDataReleaseDateSetNull = {
  Prisoner: {
    ReleaseDateIsSet: null,
  },
}

describe('services/auto-approval/checks/is-visit-in-past', () => {
  it('should return true if the ReleaseDateIsSet variable is true', () => {
    const checkResult = isReleaseDateSet(autoApprovalDataReleaseDateSet)
    expect(checkResult.result).toBe(true)
  })

  it('should return false if the ReleaseDateIsSet variable is false', () => {
    const checkResult = isReleaseDateSet(autoApprovalDataReleaseDateSetFalse)
    expect(checkResult.result).toBe(false)
  })

  it('should return false if the ReleaseDateIsSet variable is null', () => {
    const checkResult = isReleaseDateSet(autoApprovalDataReleaseDateSetNull)
    expect(checkResult.result).toBe(false)
  })
})
