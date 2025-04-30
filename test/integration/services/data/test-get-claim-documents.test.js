const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const getClaimDocuments = require('../../../../app/services/data/get-claim-documents')
const testHelper = require('../../../test-helper')

const REFERENCE = 'GETDOCS'
let eligibilityId
let claimId
let expectedCount

describe('services/data/get-claim-documents', () => {
  beforeAll(() => {
    return testHelper.insertClaimEligibilityData('IntSchema', REFERENCE).then(ids => {
      const db = getDatabaseConnector()

      eligibilityId = ids.eligibilityId
      claimId = ids.claimId

      return db
        .table('IntSchema.ClaimDocument')
        .where({ Reference: REFERENCE })
        .select()
        .then(claimDocuments => {
          expectedCount = claimDocuments.length
        })
    })
  })
  it('should get the claim documents', () => {
    return getClaimDocuments('IntSchema', REFERENCE, eligibilityId, claimId).then(claimDocuments => {
      expect(claimDocuments.length).toBe(expectedCount)
      expect(claimDocuments[0].IsEnabled).toBe(true)
    })
  })

  afterAll(() => {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
  })
})
