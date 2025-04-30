const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const updateContactDetails = require('../../../../app/services/data/update-contact-details')
const testHelper = require('../../../test-helper')

const reference = 'CONTACT'

const updatedDetails = {
  Reference: reference,
  EmailAddress: 'newTestEmail@test.com',
  PhoneNumber: '12334567',
}

describe('services/data/update-contact-details', () => {
  beforeAll(() => {
    return testHelper.insertClaimEligibilityData('IntSchema', reference).then(ids => {
      updatedDetails.EligibilityId = ids.eligibilityId
    })
  })

  it('should create update visitor to new contact details', () => {
    return updateContactDetails(updatedDetails).then(() => {
      const db = getDatabaseConnector()

      return db
        .table('IntSchema.Visitor')
        .where({ Reference: reference, EligibilityId: updatedDetails.EligibilityId })
        .first()
        .then(result => {
          expect(result.EmailAddress).toBe(updatedDetails.EmailAddress)
          expect(result.PhoneNumber).toBe(updatedDetails.PhoneNumber)
        })
    })
  })

  afterAll(() => {
    return testHelper.deleteAll(reference, 'IntSchema')
  })
})
