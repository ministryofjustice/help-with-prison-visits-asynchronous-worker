const testHelper = require('../../../test-helper')

const referenceNumberRecovery = require('../../../../app/services/data/reference-number-recovery')

const REFERENCE = 'RECOVER'

let email
let prisonNumber

describe('services/data/reference-number-recovery', function () {
  beforeAll(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', REFERENCE).then(function () {
      const claimData = testHelper.getClaimData(REFERENCE)
      email = claimData.Visitor.EmailAddress
      prisonNumber = claimData.Prisoner.PrisonNumber
    })
  })

  it('should return all first time claim data', function () {
    return referenceNumberRecovery(email, prisonNumber).then(function (result) {
      expect(result.Reference).toBe(REFERENCE)
    })
  })

  afterAll(function () {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
  })
})
