const expect = require('chai').expect
const testHelper = require('../../../test-helper')

const getVisitorEmailAddress = require('../../../../app/services/data/get-visitor-email-address')

describe('services/data/get-visitor-email-address', function () {
  const reference = 'GETVEML'
  let eligibilityId
  const claimData = testHelper.getClaimData(reference)

  before(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', reference)
      .then(function (ids) {
        eligibilityId = ids.eligibilityId
      })
  })

  it('should return visitor email address', function () {
    return getVisitorEmailAddress('IntSchema', reference, eligibilityId)
      .then(function (emailAddress) {
        expect(emailAddress).to.be.equal(claimData.Visitor.EmailAddress)
      })
  })

  after(function () {
    return testHelper.deleteAll(reference, 'IntSchema')
  })
})
