const testHelper = require('../../../test-helper')

const getVisitorEmailAddress = require('../../../../app/services/data/get-visitor-email-address')

describe('services/data/get-visitor-email-address', () => {
  const reference = 'GETVEML'
  let eligibilityId
  const claimData = testHelper.getClaimData(reference)

  beforeAll(() => {
    return testHelper.insertClaimEligibilityData('IntSchema', reference).then(ids => {
      eligibilityId = ids.eligibilityId
    })
  })

  it('should return visitor email address', () => {
    return getVisitorEmailAddress('IntSchema', reference, eligibilityId).then(emailAddress => {
      expect(emailAddress).toBe(claimData.Visitor.EmailAddress)
    })
  })

  afterAll(() => {
    return testHelper.deleteAll(reference, 'IntSchema')
  })
})
