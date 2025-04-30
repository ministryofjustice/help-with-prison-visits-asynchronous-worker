const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const disableClaimDocument = require('../../../../app/services/data/disable-claim-document')
const testHelper = require('../../../test-helper')

const REFERENCE = 'DISDOC1'
let claimDocumentId

describe('services/data/disable-claim-document', () => {
  beforeAll(() => {
    return testHelper.insertClaimEligibilityData('IntSchema', REFERENCE).then(() => {
      const db = getDatabaseConnector()

      return db
        .table('IntSchema.ClaimDocument')
        .where({ Reference: REFERENCE })
        .first()
        .then(claimDocument => {
          claimDocumentId = claimDocument.ClaimDocumentId
        })
    })
  })
  it('should disable the claim document', () => {
    return disableClaimDocument('IntSchema', claimDocumentId).then(() => {
      const db = getDatabaseConnector()

      return db
        .table('IntSchema.ClaimDocument')
        .where({ ClaimDocumentId: claimDocumentId })
        .first()
        .then(result => {
          expect(result.IsEnabled).toBe(false)
        })
    })
  })

  afterAll(() => {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
  })
})
