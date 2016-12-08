const expect = require('chai').expect
const config = require('../../../../knexfile').asyncworker
const knex = require('knex')(config)
const testHelper = require('../../../test-helper')

const moveClaimDocumentsToInternalAndUpdateExisting = require('../../../../app/services/data/move-claim-documents-to-internal-and-update-existing')

const REFERENCE = 'MOVDOCU'
var eligibilityId
var claimId

describe('services/data/move-claim-documents-to-internal-and-update-existing', function () {
  beforeEach(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', REFERENCE)
      .then(function (ids) {
        eligibilityId = ids.eligibilityId
        claimId = ids.claimId

        return knex('IntSchema.ClaimDocument').where('Reference', REFERENCE).update('DocumentStatus', 'post-later')
          .then(function () {
            var claimData = testHelper.getClaimData(REFERENCE)

            // Disable benefit document so only visit confirmation is copied
            claimData.ClaimDocument[1].IsEnabled = false

            return testHelper.insertClaimDocumentData('ExtSchema', eligibilityId, claimId, claimData.ClaimDocument)
          })
      })
  })

  it('should update Claim Status to NEW', function () {
    return moveClaimDocumentsToInternalAndUpdateExisting(REFERENCE, eligibilityId, claimId)
      .then(function () {
        return knex('IntSchema.ClaimDocument').where('Reference', REFERENCE)
          .then(function (claimDocuments) {
            var oldDocuments = claimDocuments.filter(function (document) { return document.DocumentStatus === 'post-later' })
            var newDocuments = claimDocuments.filter(function (document) { return document.DocumentStatus === 'uploaded' })

            expect(newDocuments.length, 'should have copied claim documents from external to internal').to.be.equal(1)
            expect(oldDocuments.length).to.be.equal(2)
            expect(oldDocuments[0].IsEnabled, 'should have disabled old matching documents').to.be.false
            expect(oldDocuments[1].IsEnabled, 'should not have disabled old unmatched documents').to.be.true
          })
      })
      .then(function () {
        return knex('ExtSchema.ClaimDocument').where('Reference', REFERENCE)
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
