const guernseyJerseyPrisonsEnum = require('../../../../../app/constants/guernsey-jersey-prisons-enum')
const isPrisonNotInGuernseyJersey = require('../../../../../app/services/auto-approval/checks/is-prison-not-in-guernsey-jersey')

const validAutoApprovalData = {
  Prisoner: {
    NameOfPrison: 'hewell'
  }
}

const invalidAutoApprovalData = {
  Prisoner: {
    NameOfPrison: guernseyJerseyPrisonsEnum.LES_NICOLLES.value
  }
}

describe('services/auto-approval/checks/is-prison-not-in-guernsey-jersey', function () {
  it('should return true if the prison is outside Guernsey/Jersey', function () {
    const check = isPrisonNotInGuernseyJersey(validAutoApprovalData)
    expect(check.result).toBe(true)
  })

  it('should return false if the prison is in Guernsey/Jersey', function () {
    const check = isPrisonNotInGuernseyJersey(invalidAutoApprovalData)
    expect(check.result).toBe(false)
  })
})
