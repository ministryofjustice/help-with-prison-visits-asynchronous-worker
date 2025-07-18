const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const testHelper = require('../../../test-helper')

let disableClaimDocument
let insertClaimEvent

let moveClaimDocumentsToInternal

const REFERENCE = 'MOVDOCU'
let eligibilityId
let claimId

jest.mock('./disable-claim-document', () => disableClaimDocument)
jest.mock('./insert-claim-event', () => insertClaimEvent)

describe('services/data/move-claim-documents-to-internal', () => {
  beforeEach(() => {
    return testHelper.insertClaimEligibilityData('IntSchema', REFERENCE).then(ids => {
      eligibilityId = ids.eligibilityId
      claimId = ids.claimId

      const claimData = testHelper.getClaimData(REFERENCE)
      claimData.ClaimDocument[1].IsEnabled = false

      disableClaimDocument = jest.fn().mockResolvedValue()
      insertClaimEvent = jest.fn().mockResolvedValue()

      moveClaimDocumentsToInternal = require('../../../../app/services/data/move-claim-documents-to-internal')

      return testHelper.insertClaimDocumentData('ExtSchema', eligibilityId, claimId, claimData.ClaimDocument)
    })
  })

  it('should move claim documents to from external to internal', () => {
    const db = getDatabaseConnector()

    return moveClaimDocumentsToInternal(REFERENCE, eligibilityId, claimId)
      .then(() => {
        return db('IntSchema.ClaimDocument')
          .where('Reference', REFERENCE)
          .then(claimDocuments => {
            // should have copied claim documents from external to internal
            expect(claimDocuments.length).toBe(3)
            expect(disableClaimDocument.calledOne, 'should have disabled one old document')
            expect(insertClaimEvent.calledOne, 'should have inserted an event for disabling one old document')
          })
      })
      .then(() => {
        return db('ExtSchema.ClaimDocument')
          .where('Reference', REFERENCE)
          .then(claimDocuments => {
            // should have deleted External ClaimDocuments
            expect(claimDocuments.length).toBe(0)
          })
      })
  })

  afterEach(() => {
    return testHelper.deleteAll(REFERENCE, 'IntSchema').then(() => {
      return testHelper.deleteAll(REFERENCE, 'ExtSchema')
    })
  })
})
