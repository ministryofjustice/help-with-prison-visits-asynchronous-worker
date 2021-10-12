const expect = require('chai').expect
const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const updateContactDetails = require('../../../../app/services/data/update-contact-details')
const testHelper = require('../../../test-helper')

const reference = 'CONTACT'

const updatedDetails = {
  Reference: reference,
  EmailAddress: 'newTestEmail@test.com',
  PhoneNumber: '12334567'
}

describe('services/data/update-contact-details', function () {
  before(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', reference)
      .then(function (ids) {
        updatedDetails.EligibilityId = ids.eligibilityId
      })
  })

  it('should create update visitor to new contact details', function () {
    return updateContactDetails(updatedDetails)
      .then(function () {
        const db = getDatabaseConnector()

        return db.table('IntSchema.Visitor')
          .where({ Reference: reference, EligibilityId: updatedDetails.EligibilityId })
          .first()
          .then(function (result) {
            expect(result.EmailAddress).to.be.equal(updatedDetails.EmailAddress)
            expect(result.PhoneNumber).to.be.equal(updatedDetails.PhoneNumber)
          })
      })
  })

  after(function () {
    return testHelper.deleteAll(reference, 'IntSchema')
  })
})
