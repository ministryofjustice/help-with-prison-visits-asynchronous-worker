const testHelper = require('../../../test-helper')

const referenceNumberRecovery = require('../../../../app/services/data/reference-number-recovery')

const REFERENCE = 'RECOVER'

let email
let prisonNumber

describe('services/data/reference-number-recovery', () => {
  beforeAll(() => {
    return testHelper.insertClaimEligibilityData('IntSchema', REFERENCE).then(() => {
      const claimData = testHelper.getClaimData(REFERENCE)
      email = claimData.Visitor.EmailAddress
      prisonNumber = claimData.Prisoner.PrisonNumber
    })
  })

  it('should return all first time claim data', () => {
    return referenceNumberRecovery(email, prisonNumber).then(result => {
      expect(result.Reference).toBe(REFERENCE)
    })
  })

  afterAll(() => {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
  })
})
