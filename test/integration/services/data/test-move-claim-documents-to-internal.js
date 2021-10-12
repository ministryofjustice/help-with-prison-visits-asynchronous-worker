const expect = require('chai').expect
const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const testHelper = require('../../../test-helper')
const proxyquire = require('proxyquire')
const sinon = require('sinon')

let disableClaimDocument
let insertClaimEvent

let moveClaimDocumentsToInternal

const REFERENCE = 'MOVDOCU'
let eligibilityId
let claimId

describe('services/data/move-claim-documents-to-internal', function () {
  beforeEach(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', REFERENCE)
      .then(function (ids) {
        eligibilityId = ids.eligibilityId
        claimId = ids.claimId

        const claimData = testHelper.getClaimData(REFERENCE)
        claimData.ClaimDocument[1].IsEnabled = false

        disableClaimDocument = sinon.stub().resolves()
        insertClaimEvent = sinon.stub().resolves()

        moveClaimDocumentsToInternal = proxyquire('../../../../app/services/data/move-claim-documents-to-internal', {
          './disable-claim-document': disableClaimDocument,
          './insert-claim-event': insertClaimEvent
        })

        return testHelper.insertClaimDocumentData('ExtSchema', eligibilityId, claimId, claimData.ClaimDocument)
      })
  })

  it('should move claim documents to from external to internal', function () {
    const db = getDatabaseConnector()

    return moveClaimDocumentsToInternal(REFERENCE, eligibilityId, claimId)
      .then(function () {
        return db('IntSchema.ClaimDocument').where('Reference', REFERENCE)
          .then(function (claimDocuments) {
            expect(claimDocuments.length, 'should have copied claim documents from external to internal').to.be.equal(3)
            expect(disableClaimDocument.calledOne, 'should have disabled one old document')
            expect(insertClaimEvent.calledOne, 'should have inserted an event for disabling one old document')
          })
      })
      .then(function () {
        return db('ExtSchema.ClaimDocument').where('Reference', REFERENCE)
          .then(function (claimDocuments) {
            expect(claimDocuments.length, 'should have deleted External ClaimDocuments').to.be.equal(0)
          })
      })
  })

  afterEach(function () {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
      .then(function () { return testHelper.deleteAll(REFERENCE, 'ExtSchema') })
  })
})
