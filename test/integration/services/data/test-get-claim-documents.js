const expect = require('chai').expect
const config = require('../../../../knexfile').asyncworker
const knex = require('knex')(config)
const getClaimDocuments = require('../../../../app/services/data/get-claim-documents')
const testHelper = require('../../../test-helper')

const REFERENCE = 'GETDOCS'
var eligibilityId
var claimId
var expectedCount

describe('services/data/get-claim-documents', function () {
  before(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', REFERENCE)
      .then(function (ids) {
        eligibilityId = ids.eligibilityId
        claimId = ids.claimId

        return knex.table('IntSchema.ClaimDocument').where({'Reference': REFERENCE}).select()
          .then(function (claimDocuments) {
            expectedCount = claimDocuments.length
          })
      })
  })
  it('should get the claim documents', function () {
    return getClaimDocuments('IntSchema', REFERENCE, eligibilityId, claimId)
      .then(function (claimDocuments) {
        expect(claimDocuments.length).to.equal(expectedCount)
        expect(claimDocuments[0].IsEnabled).to.be.true
      })
  })

  after(function () {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
  })
})
