const expect = require('chai').expect
const config = require('../../../../knexfile').asyncworker
const knex = require('knex')(config)
const testHelper = require('../../../test-helper')

const moveClaimDocumentsToInternal = require('../../../../app/services/data/move-claim-documents-to-internal')

const REFERENCE = 'MOVDOCU'
var eligibilityId
var claimId

describe('services/data/move-claim-documents-to-internal', function () {
  beforeEach(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', REFERENCE)
      .then(function (ids) {
        eligibilityId = ids.eligibilityId
        claimId = ids.claimId

        var claimData = testHelper.getClaimData(REFERENCE)
        claimData.ClaimDocument[1].IsEnabled = false

        return testHelper.insertClaimDocumentData('ExtSchema', eligibilityId, claimId, claimData.ClaimDocument)
      })
  })

  it('should update Claim Status to NEW', function () {
    return moveClaimDocumentsToInternal(REFERENCE, eligibilityId, claimId)
      .then(function () {
        return knex('IntSchema.ClaimDocument').where('Reference', REFERENCE)
          .then(function (claimDocuments) {
            expect(claimDocuments.length, 'should have copied claim documents from external to internal').to.be.equal(3)
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
