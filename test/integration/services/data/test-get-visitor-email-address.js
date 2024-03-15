const testHelper = require('../../../test-helper')

const getVisitorEmailAddress = require('../../../../app/services/data/get-visitor-email-address')

describe('services/data/get-visitor-email-address', function () {
  const reference = 'GETVEML'
  let eligibilityId
  const claimData = testHelper.getClaimData(reference)

  beforeAll(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', reference)
      .then(function (ids) {
        eligibilityId = ids.eligibilityId
      })
  })

  it('should return visitor email address', function () {
    return getVisitorEmailAddress('IntSchema', reference, eligibilityId)
      .then(function (emailAddress) {
        expect(emailAddress).toBe(claimData.Visitor.EmailAddress)
      });
  })

  afterAll(function () {
    return testHelper.deleteAll(reference, 'IntSchema')
  })
})
