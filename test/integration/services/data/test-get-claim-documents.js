const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const getClaimDocuments = require('../../../../app/services/data/get-claim-documents')
const testHelper = require('../../../test-helper')

const REFERENCE = 'GETDOCS'
let eligibilityId
let claimId
let expectedCount

describe('services/data/get-claim-documents', function () {
  beforeAll(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', REFERENCE)
      .then(function (ids) {
        const db = getDatabaseConnector()

        eligibilityId = ids.eligibilityId
        claimId = ids.claimId

        return db.table('IntSchema.ClaimDocument').where({ Reference: REFERENCE }).select()
          .then(function (claimDocuments) {
            expectedCount = claimDocuments.length
          })
      })
  })
  it('should get the claim documents', function () {
    return getClaimDocuments('IntSchema', REFERENCE, eligibilityId, claimId)
      .then(function (claimDocuments) {
        expect(claimDocuments.length).toBe(expectedCount)
        expect(claimDocuments[0].IsEnabled).toBe(true) //eslint-disable-line
      })
  })

  afterAll(function () {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
  })
})
